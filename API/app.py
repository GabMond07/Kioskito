from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from datetime import datetime, timedelta, timezone
import os
from jose import jwt, JWTError
from passlib.context import CryptContext
from typing import Dict, Set, List
from fastapi import Header
from pydantic import BaseModel

# Configuración inicial
app = FastAPI()
prisma = Prisma()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de JWT
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-default-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

BLOCKLIST: Set[str] = set()

# Modelos Pydantic para validación
class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    id_rol: int | None = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    id_rol: int
    create_at: datetime

# Funciones auxiliares para JWT
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: Dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access", "sub": str(data["sub"])})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "sub": str(data["sub"])})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if token in BLOCKLIST:
            raise HTTPException(status_code=401, detail="Token inválido (en lista negra)")
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

# Dependency para obtener usuario actual
async def get_current_user(authorization: str = Header(..., alias="Authorization")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Formato de token inválido")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user_id = int(payload.get("sub"))
    
    user = await prisma.users.find_unique(
        where={"id": user_id},
        include={"Roles": True}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return user

# Middleware para verificar la conexión de Prisma
@app.middleware("http")
async def ensure_prisma_connected(request: Request, call_next):
    if not prisma.is_connected():
        try:
            await prisma.connect()
            print("✅ Prisma reconectado mediante middleware")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al conectar con Prisma: {str(e)}")
    response = await call_next(request)
    return response

# Eventos de ciclo de vida
@app.on_event("startup")
async def startup():
    try:
        await prisma.connect()
        print("✅ Prisma conectado en startup")
    except Exception as e:
        print(f"❌ Error al conectar con Prisma en startup: {str(e)}")
        raise e

@app.on_event("shutdown")
async def shutdown():
    try:
        if prisma.is_connected():
            await prisma.disconnect()
            print("🔌 Prisma desconectado en shutdown")
    except Exception as e:
        print(f"❌ Error al desconectar Prisma en shutdown: {str(e)}")

# Rutas de autenticación 
@app.post("/users/register")
async def register(request: Request):
    try:
        data = await request.json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            raise HTTPException(status_code=400, detail="Faltan campos: username, email y password son requeridos")

        existing_user = await prisma.users.find_first(
            where={
                "OR": [
                    {"name": username},
                    {"email": email}
                ]
            }
        )
        if existing_user:
            if existing_user.name == username:
                raise HTTPException(status_code=400, detail="El username ya existe")
            if existing_user.email == email:
                raise HTTPException(status_code=400, detail="El email ya existe")

        hashed = get_password_hash(password)
        user = await prisma.users.create(
            data={
                "name": username,
                "email": email,
                "password": hashed,
                "create_at": datetime.utcnow(),
                "id_rol": 1
            }
        )

        user_id_str = str(user.id)
        access_token = create_access_token({"sub": user_id_str})
        refresh_token_str = create_refresh_token({"sub": user_id_str})

        await prisma.authtoken.create(
            data={
                "token": refresh_token_str,
                "expiresAt": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
                "userId": user.id,
                "ipAddress": request.client.host,
                "deviceInfo": request.headers.get("User-Agent", "")
            }
        )

        return {
            "msg": "Usuario creado con éxito",
            "user_id": user.id,
            "access_token": access_token,
            "refresh_token": refresh_token_str
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {str(e)}")

@app.post("/users/login")
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Faltan campos: email y password son requeridos")

        user = await prisma.users.find_first(where={"email": email})

        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas o incorrectas")

        user_id_str = str(user.id)
        access_token = create_access_token({"sub": user_id_str})
        refresh_token_str = create_refresh_token({"sub": user_id_str})

        await prisma.authtoken.create(data={
            "token": refresh_token_str,
            "expiresAt": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            "userId": user.id,
            "ipAddress": request.client.host,
            "deviceInfo": request.headers.get("User-Agent", "")
        })

        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {str(e)}")

@app.post("/users/refresh")
async def refresh_token(request: Request):
    try:
        data = await request.json()
        old_token_str = data.get("refresh_token")

        if not old_token_str:
            raise HTTPException(status_code=400, detail="Refresh token es requerido")

        db_token = await prisma.authtoken.find_unique(where={"token": old_token_str})

        if not db_token:
            raise HTTPException(status_code=401, detail="Refresh token inválido")

        if db_token.revokedAt or db_token.expiresAt < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Refresh token expirado o revocado")

        # Crear nuevos tokens
        user_id_str = str(db_token.userId)
        new_access_token = create_access_token({"sub": user_id_str})
        new_refresh_token_str = create_refresh_token({"sub": user_id_str})

        new_db_token = await prisma.authtoken.create(data={
            "token": new_refresh_token_str,
            "expiresAt": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            "userId": db_token.userId,
            "ipAddress": request.client.host,
            "deviceInfo": request.headers.get("User-Agent", "")
        })

        # Marcar el token anterior como revocado y reemplazado
        await prisma.authtoken.update(
            where={"token": old_token_str},
            data={
                "revokedAt": datetime.now(timezone.utc),
                "replacedByTokenId": new_db_token.id
            }
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token_str
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al refrescar token: {str(e)}")

@app.post("/users/logout")
async def logout(
    request: Request,
    authorization: str = Header(..., alias="Authorization")
):
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=400, detail="Formato de token inválido")

        token = authorization.split(" ")[1]
        payload = decode_token(token)

        # Agregar access_token a la BLOCKLIST
        BLOCKLIST.add(token)

        user_id = int(payload.get("sub"))

        # Eliminar todos los refresh tokens asociados al usuario
        await prisma.authtoken.delete_many(
            where={"userId": user_id}
        )

        return JSONResponse(content={"msg": "Sesión cerrada exitosamente"})
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cerrar sesión: {str(e)}")

# CRUD de usuarios
@app.get("/users", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(get_current_user)):
    try:
        # Verificar si el usuario tiene permisos de administrador (id_rol = 1, asumir que 1 es admin)
        if current_user.id_rol != 1:
            raise HTTPException(status_code=403, detail="No tienes permisos para listar usuarios")

        users = await prisma.users.find_many(
            include={"Roles": True},
            order={"create_at": "desc"}
        )
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {str(e)}")

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    try:
        # Los usuarios pueden ver su propio perfil, los admins pueden ver cualquier perfil
        if current_user.id != user_id and current_user.id_rol != 1:
            raise HTTPException(status_code=403, detail="No tienes permisos para ver este usuario")

        user = await prisma.users.find_unique(
            where={"id": user_id},
            include={"Roles": True}
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")

@app.put("/users/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    try:
        # Los usuarios pueden actualizar su propio perfil, los admins pueden actualizar cualquier perfil
        if current_user.id != user_id and current_user.id_rol != 1:
            raise HTTPException(status_code=403, detail="No tienes permisos para actualizar este usuario")

        update_data = {}
        if user_update.name:
            update_data["name"] = user_update.name
        if user_update.email:
            # Verificar si el nuevo email ya existe
            existing_email = await prisma.users.find_first(
                where={"email": user_update.email, "id": {"not": user_id}}
            )
            if existing_email:
                raise HTTPException(status_code=400, detail="El email ya está en uso")
            update_data["email"] = user_update.email
        if user_update.password:
            update_data["password"] = get_password_hash(user_update.password)
        if user_update.id_rol and current_user.id_rol == 1:  # Solo admins pueden cambiar roles
            # Verificar si el rol existe
            role = await prisma.roles.find_unique(where={"id": user_update.id_rol})
            if not role:
                raise HTTPException(status_code=400, detail="Rol no encontrado")
            update_data["id_rol"] = user_update.id_rol

        if not update_data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

        user = await prisma.users.update(
            where={"id": user_id},
            data=update_data,
            include={"Roles": True}
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    try:
        # Solo los admins pueden eliminar usuarios
        if current_user.id_rol != 1:
            raise HTTPException(status_code=403, detail="No tienes permisos para eliminar usuarios")

        user = await prisma.users.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Eliminar tokens asociados
        await prisma.authtoken.delete_many(where={"userId": user_id})
        
        # Eliminar usuario
        await prisma.users.delete(where={"id": user_id})
        
        return JSONResponse(content={"msg": "Usuario eliminado exitosamente"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")

# New endpoint to check subscription status
@app.get("/users/{user_id}/subscription/status")
async def get_subscription_status(user_id: int, current_user: dict = Depends(get_current_user)):
    try:
        # Only the user themselves or an admin (id_rol = 1) can check subscription status
        if current_user.id != user_id and current_user.id_rol != 1:
            raise HTTPException(status_code=403, detail="No tienes permisos para verificar esta suscripción")

        # Check for active subscription
        subscription = await prisma.suscriptions.find_first(
            where={
                "id_user": user_id,
                "status": "active",
                "end_date": {"gt": datetime.now(timezone.utc)},  # Ensure subscription hasn't expired
            }
        )

        return {"has_active_subscription": bool(subscription)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al verificar estado de suscripción: {str(e)}")
        
if __name__ == "__main__":
    if "JWT_SECRET_KEY" not in os.environ:
        print("ADVERTENCIA: JWT_SECRET_KEY no está configurada. Usando valor por defecto.")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="debug", loop="asyncio")
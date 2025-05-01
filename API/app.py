from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from prisma import Prisma
from datetime import datetime, timedelta
import asyncio
import os
import uvicorn

# Prisma global
prisma = Prisma()

def get_prisma_client():
    global prisma
    if prisma is None:
        raise RuntimeError("Prisma client is not initialized.")
    return prisma

def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-default-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    jwt = JWTManager(app)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    BLOCKLIST = set()

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in BLOCKLIST

    @app.route("/register", methods=["POST"])
    async def register():
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"msg": "Faltan campos"}), 400

        db = get_prisma_client()

        existing = await db.user.find_unique(where={"username": username})
        if existing:
            return jsonify({"msg": "Usuario ya existe"}), 400

        hashed = generate_password_hash(password)
        user = await db.user.create(
            data={
                "username": username,
                "passwordHash": hashed
            }
        )
        return jsonify({"msg": "Usuario creado con éxito", "user_id": user.id}), 201

    @app.route("/login", methods=["POST"])
    async def login():
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        db = get_prisma_client()
        user = await db.user.find_unique(where={"username": username})

        if not user or not check_password_hash(user.passwordHash, password):
            return jsonify({"msg": "Credenciales inválidas"}), 401

        user_id_str = str(user.id)
        access_token = create_access_token(identity=user_id_str)
        refresh_token = create_refresh_token(identity=user_id_str)

        await db.refreshtoken.create(data={
            "token": refresh_token,
            "expiresAt": datetime.utcnow() + timedelta(days=7),
            "userId": user.id,
            "ipAddress": request.remote_addr,
            "deviceInfo": request.headers.get("User-Agent", "")
        })

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    @app.route("/refresh", methods=["POST"])
    @jwt_required(refresh=True)
    async def refresh():
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=current_user_id)
        return jsonify(access_token=access_token), 200

    @app.route("/logout", methods=["POST"])
    @jwt_required(refresh=True)
    async def logout():
        jti = get_jwt()["jti"]
        BLOCKLIST.add(jti)
        return jsonify({"msg": "Sesión cerrada correctamente"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    if "JWT_SECRET_KEY" not in os.environ:
        print("ADVERTENCIA: JWT_SECRET_KEY no está configurada. Usando valor por defecto.")

    try:
        asyncio.run(prisma.connect())
        print("✅ Prisma conectado")
    except Exception as e:
        print(f"❌ Error al conectar con Prisma: {e}")
        exit(1)

    app.run(host="0.0.0.0", port=5000, debug=True)

    if prisma.is_connected():
        asyncio.run(prisma.disconnect())
        print("🔌 Prisma desconectado")

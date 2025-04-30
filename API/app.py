# Kioskito/API/App.py

from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_cors import CORS
from prisma import Prisma
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import asyncio
import uvicorn

# --- Prisma global ---
prisma = Prisma()

def get_prisma_client():
    global prisma
    if prisma is None:
        raise RuntimeError("Prisma client is not initialized.")
    return prisma

# --- Crear app ---
def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-dev")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    jwt = JWTManager(app)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    BLOCKLIST = set()

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in BLOCKLIST

    # --- REGISTER ---
    @app.route("/register", methods=["POST"])
    def register():
        db = get_prisma_client()
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        try:
            user = asyncio.run(db.user.find_unique(where={"email": email}))
            if user:
                return jsonify({"error": "El usuario ya existe"}), 409

            hashed_password = generate_password_hash(password)

            new_user = asyncio.run(db.user.create({
                "data": {
                    "email": email,
                    "password": hashed_password,
                    "created_at": datetime.utcnow().isoformat()
                }
            }))

            access_token = create_access_token(identity=new_user.id)
            refresh_token = create_refresh_token(identity=new_user.id)

            return jsonify({
                "msg": "Usuario registrado",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": new_user.id,
                    "email": new_user.email
                }
            }), 201
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "Error interno"}), 500

    # --- LOGIN ---
    @app.route("/login", methods=["POST"])
    def login():
        db = get_prisma_client()
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Faltan datos"}), 400

        try:
            user = asyncio.run(db.user.find_unique(where={"email": email}))
            if not user or not check_password_hash(user.password, password):
                return jsonify({"error": "Credenciales inválidas"}), 401

            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)

            return jsonify({
                "msg": "Inicio de sesión exitoso",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user.id,
                    "email": user.email
                }
            }), 200
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "Error interno"}), 500

    # --- REFRESH TOKEN ---
    @app.route("/refresh", methods=["POST"])
    @jwt_required(refresh=True)
    def refresh_token():
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        return jsonify({"access_token": access_token}), 200

    # --- LOGOUT ---
    @app.route("/logout", methods=["POST"])
    @jwt_required()
    def logout():
        jti = get_jwt()["jti"]
        BLOCKLIST.add(jti)
        return jsonify({"msg": "Sesión cerrada correctamente"}), 200

    return app

# --- Instancia de la app ---
app = create_app()

# --- Ejecutar con Prisma conectado ---
if __name__ == "__main__":
    if "JWT_SECRET_KEY" not in os.environ:
        print("⚠️  ADVERTENCIA: usando clave secreta por defecto.")

    try:
        asyncio.run(prisma.connect())
        print("✅ Prisma conectado correctamente.")
    except Exception as e:
        print(f"❌ Error al conectar Prisma: {e}")

    app.run(host="0.0.0.0", port=5000, debug=True)

    if prisma.is_connected():
        asyncio.run(prisma.disconnect())
        print("🔌 Prisma desconectado.")

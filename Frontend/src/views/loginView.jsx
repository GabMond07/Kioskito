import React from 'react';

function loginView() {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar sesión</h2>
        
        <form>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-2">Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
    )
  }
  
  export default loginView
  
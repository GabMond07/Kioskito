import Logo from "../Assets/Logo.avif";
import { Link } from "react-router-dom";
import { useState } from "react";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // modal
  const [formType, setFormType] = useState("register"); // 'register' o 'login'

  // Función para abrir el modal con el tipo (login o register)
  const openModal = (type) => {
    setFormType(type);
    setModalOpen(true);
    setIsOpen(false); // cerrar menú móvil si está abierto
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalOpen(false);
  };

// Función para manejar el inicio de sesión
const handleLogin = async (e) => {
  e.preventDefault(); // Prevenir el comportamiento predeterminado de submit

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // Guardar los tokens en localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      alert("Inicio de sesión exitoso");
      closeModal(); // Cerrar el modal al hacer login
    } else {
      alert(data.msg); // Mostrar el mensaje de error
    }
  } catch (error) {
    console.error("Error al intentar iniciar sesión", error);
    alert("Error en la autenticación");
  }
};


return (
  <>
    <nav className="border-b border-gray-200 py-3 px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 overflow-hidden rounded-md">
          <img
            src={Logo}
            alt="Kioskito Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-[#8AB8B3] font-semibold text-xl tracking-wide">
          KiosKitoDigital
        </span>
      </div>

      {/* Links escritorio */}
      <div className="hidden md:flex items-center gap-6">
        <button
          onClick={() => openModal("register")}
          className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
        >
          Registrarse
        </button>
        <button
          onClick={() => openModal("login")}
          className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>

      {/* Menú móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-[#E68A7B]"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Menú móvil */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-4 md:hidden z-50">
          <button
            onClick={() => openModal("register")}
            className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
          >
            Registrarse
          </button>
          <button
            onClick={() => openModal("login")}
            className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      )}
    </nav>

    {/* Modal */}
    {modalOpen && (
      <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-[#8AB8B3] text-center">
            {formType === "register" ? "Registro" : "Iniciar Sesión"}
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block mb-1 text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Ingresa una contraseña"
                className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#E68A7B] text-white font-semibold py-2 rounded hover:bg-[#d77565] transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )}
  </>
);
}

export default Navigation;
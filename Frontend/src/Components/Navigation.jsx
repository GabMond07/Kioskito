import Logo from "../Assets/Logo.avif";
import { Link } from "react-router-dom";
import { useState } from "react";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="border-b border-gray-200 py-3 px-6 md:px-10 flex items-center justify-between">
      {/* Logo a la izquierda */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-16 w-16 overflow-hidden rounded-md">
            <img
              src={Logo}
              alt="Kioskito Logo"
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-[#8AB8B3] font-semibold text-xl tracking-wide">
            KiosKitoDigital
          </span>
        </Link>
      </div>

      {/* Links a la derecha en escritorio */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/Register"
          className="text-[#E68A7B] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
        >
          Registrarse
        </Link>
        <Link
          to="/Login"
          className="text-[#E68A7B] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>

      {/* Botón menú hamburguesa (solo en móvil) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-[#E68A7B] focus:outline-none"
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

      {/* Menú móvil desplegable */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-4 md:hidden z-50">
          <Link
            to="/Register"
            className="text-[#E68A7B] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Registrarse
          </Link>
          <Link
            to="/Login"
            className="text-[#E68A7B] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Iniciar Sesión
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

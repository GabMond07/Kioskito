import Logo from "../Assets/Logo.avif";
import { Link } from "react-router-dom";

function NavBarAdmin() {
  return (
    <nav className="border-b border-gray-200 py-3 px-6 md:px-10 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 overflow-hidden rounded-md">
          <img
            src={Logo}
            alt="Kioskito Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-[#8AB8B3] font-semibold text-xl tracking-wide">
          Panel de Administrador
        </span>
      </div>

      {/* Links de navegación - CENTRADOS */}
      <div className="hidden md:flex items-center justify-center gap-8 flex-1 mx-4">
        <Link
          to="/"
          className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors px-3 py-1"
        >
          Gestionar Contenido Digital
        </Link>
        <Link
          to="/"
          className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors px-3 py-1"
        >
          Gestionar Colaboradores
        </Link>
      </div>

      {/* Iconos (derecha) */}
      <div className="hidden md:flex items-center gap-4">
        <button className="text-[#EE6832] hover:text-[#8AB8B3] p-1">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <button className="text-[#EE6832] hover:text-[#8AB8B3] p-1">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>

      {/* Botón hamburguesa (solo móvil) */}
      <button className="md:hidden text-[#E68A7B]">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  );
}

export default NavBarAdmin;

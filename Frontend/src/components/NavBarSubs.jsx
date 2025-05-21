import Logo from "../Assets/Logo.avif";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Loader from "./ui/Loader";

function NavBarSubs() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // menú perfil
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <>
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
            KiosKitoDigital
          </span>
        </div>

        {/* Links escritorio */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/subscription"
            className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
          >
            Subscripciones
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="text-[#EE6832] hover:text-[#8AB8B3]"
            >
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
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-[#EE6832] hover:bg-gray-100 hover:text-[#8AB8B3]"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botón hamburguesa */}
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
              className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors flex items-center gap-2"
              onClick={handleLogout}
            >
              Cerrar Sesión
              <svg
                className="w-5 h-5"
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
        )}
      </nav>
    </>
  );
}

export default NavBarSubs;

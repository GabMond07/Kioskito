import Logo from "../Assets/Logo.avif";
import { useState, useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // menú perfil
  const [modalOpen, setModalOpen] = useState(false); // modal
  const [formType, setFormType] = useState("register"); // 'register' o 'login'
  const { login, register, user, logout } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsOpen(false); // Close mobile menu if open
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formType === 'register') {
        // Handle registration
        await register(fullname, email, password);
        closeModal();
        navigate('/home');
      } else {
        // Handle login
        await login(email, password);
        closeModal();
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullname('');
    setError('');
  };

  const openModal = (type) => {
    setFormType(type);
    setModalOpen(true);
    setIsOpen(false); // cerrar menú móvil si está abierto
  };

  const closeModal = () => {
    setModalOpen(false);
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
        {user ? (
          <>
            <Link
              to="/"
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/books"
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Libros
            </Link>
            <Link
              to="/mylist"
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Mi Lista
            </Link>
            <Link
              to="/popular"
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Novedades Populares
            </Link>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-[#8AB8B3]"
              />
            </div>
            <button className="text-[#EE6832] hover:text-[#8AB8B3]">
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
          </>
        ) : (
          <>
            <button
              onClick={() => openModal('register')}
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Registrarse
            </button>
            <button
              onClick={() => openModal('login')}
              className="text-[#EE6832] font-semibold text-lg hover:text-[#8AB8B3] transition-colors"
            >
              Iniciar Sesión
            </button>
          </>
        )}
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
          {user ? (
            <>
              <a
                href="/"
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </a>
              <a
                href="/books"
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Libros
              </a>
              <a
                href="/my-list"
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Mi Lista
              </a>
              <a
                href="/popular"
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Novedades Populares
              </a>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="border border-gray-300 rounded px-3 py-1 w-full focus:outline-none focus:border-[#8AB8B3]"
                />
              </div>
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
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  openModal('register');
                  setIsOpen(false);
                }}
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
              >
                Registrarse
              </button>
              <button
                onClick={() => {
                  openModal('login');
                  setIsOpen(false);
                }}
                className="text-[#E68A7B] font-semibold text-lg hover:text-[#EE6832] transition-colors"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </nav>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                closeModal();
                resetForm();
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-[#8AB8B3] text-center">
              {formType === "register" ? "Registro" : "Iniciar Sesión"}
            </h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-1 text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa una contraseña"
                  className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {formType === "register" && (
                <div>
                  <label
                    htmlFor="fullname"
                    className="block mb-1 text-gray-700"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Nombre completo"
                    className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-[#E68A7B] text-white font-semibold py-2 rounded hover:bg-[#d77565] transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Procesando...'
                  : formType === 'register'
                  ? 'Registrarse'
                  : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;

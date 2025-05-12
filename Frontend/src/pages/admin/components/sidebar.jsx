import { useState } from "react";
import { Link } from "react-router-dom";

const SidebarAdmin = ({ onButtonClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-white/40 text-base-content transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-70"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y botón toggle */}
          <div className="flex items-center justify-end p-4 border-base-300">
            <button
              onClick={toggleSidebar}
              className="btn btn-ghost bg-[#EE6832]/80 btn-sm rounded-full"
            >
              {collapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* titulo */}
          {!collapsed && (
            <span className="text-xl text-center font-bold mt-5 mb-5 text-black/80">
              Bienvenido al panel de administrador
            </span>
          )}

          {/* Menú de acciones - 3 botones de ancho completo */}
          <div className="flex-1 flex flex-col p-2 space-y-5">
            <button
              onClick={() => onButtonClick('agregar')}
              className="btn bg-[#8AB8B3] border-0 hover:bg-[#7AA8A3] transition-colors w-full justify-start mb-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && "Agregar Libro"}
            </button>

            <button
              onClick={() => onButtonClick('modificar')}
              className="btn bg-[#8AB8B3] border-0 hover:bg-[#7AA8A3] transition-colors w-full justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              {!collapsed && "Modificar Libro"}
            </button>

            <button
              onClick={() => onButtonClick('eliminar')}
              className="btn bg-[#8AB8B3] border-0 hover:bg-[#7AA8A3] transition-colors w-full justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && "Eliminar Libro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAdmin;

function formEliminar() {
  return (
    <div className="p-6">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar libro..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EE6832] bg-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Formulario para eliminar libro */}
      <form className="space-y-4">
        <div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors"
        >
          Eliminar
        </button>
      </form>
    </div>
  );
}

export default formEliminar;

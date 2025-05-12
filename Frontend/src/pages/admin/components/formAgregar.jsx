function AgregarLibro() {
  return (
    <div className="p-6">
      {/* Formulario para agregar libro */}
      <form className="space-y-4 ">
        <div>
          <label className="block mb-1">Título</label>
          <input
            type="text"
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <div>
          <label className="block mb-1">Autor</label>
          <input
            type="text"
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors">
          Guardar
        </button>
      </form>
    </div>
  );
}

export default AgregarLibro;

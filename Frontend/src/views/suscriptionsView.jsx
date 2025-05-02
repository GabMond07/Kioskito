function SuscriptionsView() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-16">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#EE6832]">
        Elige tu tipo de suscripción
      </h1>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Suscripción Normal */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#8AB8B3]">
            Suscripción Cliente
          </h2>
          <p className="text-gray-700 mb-6">
            Accede a contenido exclusivo, descuentos especiales en libros y
            actualizaciones mensuales.
          </p>
          <button className="bg-[#EE6832] text-white px-4 py-2 rounded hover:bg-[#d45a1f] transition-colors">
            Suscribirse
          </button>
        </section>

        {/* Suscripción de Colaborador */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#8AB8B3]">
            Suscripción Colaborador
          </h2>
          <p className="text-gray-700 mb-6">
            Comparte tus libros, participa en eventos y forma parte de nuestra
            comunidad de autores.
          </p>
          <button className="bg-[#EE6832] text-white px-4 py-2 rounded hover:bg-[#d45a1f] transition-colors">
            Suscribirse
          </button>
        </section>
      </main>
    </div>
  );
}

export default SuscriptionsView;

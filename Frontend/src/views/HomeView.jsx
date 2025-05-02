function HomeView() {
  return (
    <main className="py-5 px-6 md:px-10 min-h-screen">
        {/* Seccion de continuar libros */}
        <section>
        <h2 className="text-1xl font-bold text-gray-900 mb-5">Continuar leyendo</h2>
        </section>
        {/* Seccion de libros recomendados */}
        <section>
        <h2 className="text-1xl font-bold text-gray-900 mb-5">Tu proxima historia</h2>
        </section>
    </main>
  );
}

export default HomeView;
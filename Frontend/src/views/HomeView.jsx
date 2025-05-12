import Libro from "../components/Libro.jsx";
import Libro1 from "../assets/Bridgerton.jpeg";
import Libro2 from "../assets/El-Principito.jpeg";
import Libro3 from "../assets/Alas-de-sangre.jpeg";
import Libro4 from "../assets/A-Game-of-Thrones.jpeg";
import Libro5 from "../assets/Metamorfosis.jpeg";
import Libro6 from "../assets/geografia.jpg";
import Libro7 from "../assets/twilight-breaking-dawn.jpg";
import Libro8 from "../assets/latregua.jpeg";

function HomeView() {
  return (
    <main className="py-5 px-6 md:px-10 min-h-screen">
      {/* Seccion de continuar libros */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Continuar leyendo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Libro
            imagen={Libro1}
            autor="Julia Quinn"
            titulo="El corazón de una Bridgerton"
          />
          <Libro
            imagen={Libro2}
            autor="Antoine de Saint"
            titulo="El Principito"
          />
          <Libro
            imagen={Libro3}
            autor="Rebecca Yarros"
            titulo="Alas de Sangre"
          />
        </div>{" "}
        <br />
      </section>
      {/* Seccion de libros recomendados */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Tu proxima historia
        </h2>{" "}
        <br />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Libro
            imagen={Libro4}
            autor="George R. R. Martin"
            titulo="A Game of Thrones"
          />
          <Libro imagen={Libro5} autor="Franz Kafka" titulo="La Metamorfosis" />
          <Libro
            imagen={Libro6}
            autor="George R. R. Martin"
            titulo="Geografia"
          />
          <Libro
            imagen={Libro7}
            autor="George R. R. Martin"
            titulo="Twilight"
          />
          <Libro
            imagen={Libro8}
            autor="Mario Benedeti"
            titulo="La Tregua"
          />
        </div>
      </section>
    </main>
  );
}

export default HomeView;

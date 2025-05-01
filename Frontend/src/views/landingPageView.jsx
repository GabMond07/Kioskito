import imagen from "../Assets/background-books.jpg";
import Libro from "../Components/Libro.jsx";
import Libro1 from "../Assets/Bridgerton.jpeg";
import Libro2 from "../Assets/El-Principito.jpeg";
import Libro3 from "../Assets/Alas-de-sangre.jpeg";
import Libro4 from "../Assets/A-Game-of-Thrones.jpeg";
import Libro5 from "../Assets/Metamorfosis.jpeg";

function LandingPageView() {
  return (
    <>
      {/* Banner con fondo de libros */}
      <div
        className="w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${imagen})` }}
      >
        <div className="max-w-2xl p-6 text-center bg-opacity-20 rounded-lg">
          <h1 className="text-4xl mb-5 font-extrabold text-[#EE6832] drop-shadow-md">
            ¡Bienvenido a KiosKitoDigital!
          </h1>
          <span className="text-lg font-bold text-gray-900">
            Explora, aprende y descubre un mundo de conocimientos a un solo
            clic.
          </span>
        </div>
      </div>

      {/* Sección de libros destacados */}
      <div className="py-5 px-6 md:px-10">
        <h2 className="text-1xl font-bold text-gray-900 mb-5">Más Populares</h2>
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
          <Libro
            imagen={Libro4}
            autor="George R. R. Martin"
            titulo="A Game of Thrones"
          />
          <Libro imagen={Libro5} autor="Franz Kafka" titulo="La Metamorfosis" />
        </div>
      </div>
    </>
  );
}

export default LandingPageView;

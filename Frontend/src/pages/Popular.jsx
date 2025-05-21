import { useEffect, useState } from "react";
import axios from "axios";
import Libro from "../components/Libro";

function Popular() {
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // ← Para animación de carga

  useEffect(() => {
    axios
      .get("http://localhost/Servicio-Php/ObtenerLibros?random=10")
      .then((res) => {
        if (res.data.success) {
          setLibros(res.data.data);
        } else {
          setError(res.data.message || "No se pudieron obtener los libros.");
        }
      })
      .catch(() => {
        setError("Error al conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Separar libros en 2 secciones
  const primerosCinco = libros.slice(0, 5);
  const ultimosCinco = libros.slice(5, 10);

  return (
    <main className="py-5 px-6 md:px-10 min-h-screen">
      <h1 className="text-xl font-bold text-gray-900 mb-5">
        Novedades Populares
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Sección 1 */}
          <div className="py-5 px-6 md:px-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Más Populares
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {primerosCinco.map((libro, index) => (
                <Libro
                  key={index}
                  imagen={
                    libro.cover_image_url ||
                    "https://via.placeholder.com/148x227"
                  }
                  autor={libro.author}
                  titulo={libro.title}
                />
              ))}
            </div>
          </div>

          {/* Sección 2 */}
          <div className="py-5 px-6 md:px-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Recomendados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ultimosCinco.map((libro, index) => (
                <Libro
                  key={index}
                  imagen={
                    libro.cover_image_url ||
                    "https://via.placeholder.com/148x227"
                  }
                  autor={libro.author}
                  titulo={libro.title}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default Popular;

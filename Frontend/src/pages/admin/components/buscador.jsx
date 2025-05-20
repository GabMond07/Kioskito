import {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import Libro from "./Libro";

// Debounce casero
function debounce(fn, delay) {
  let timeout;
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

const BuscadorAsincrono = forwardRef(({ onSeleccion }, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // Exponemos métodos al padre
  useImperativeHandle(ref, () => ({
    limpiarInput: () => {
      setInputValue("");
      setSelectedBook(null);
      onSeleccion?.(null); // también limpiamos selección en el padre
    },
  }));

  const fetchSugerencias = async (query) => {
    if (query.length < 2) {
      setSugerencias([]);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost/Servicio-Php/ObtenerLibros?search=${encodeURIComponent(
          query
        )}`
      );
      if (response.data.success) {
        setSugerencias(response.data.data);
      }
    } catch (error) {
      console.error("Error obteniendo sugerencias:", error);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce(fetchSugerencias, 200),
    [fetchSugerencias]
  );

  useEffect(() => {
    debouncedFetch(inputValue);
    return () => {
      debouncedFetch.cancel();
    };
  }, [inputValue, debouncedFetch]);

  useEffect(() => {
    const book = sugerencias.find((l) => l.title === inputValue);
    if (book) {
      setSelectedBook(book);
      onSeleccion?.(book);
    } else {
      setSelectedBook(null);
      onSeleccion?.(null);
    }
  }, [inputValue, sugerencias, onSeleccion]);

  return (
    <div>
      <label className="block mb-2">Buscar libro</label>
      <div className="relative">
        <input
          list="sugerencias"
          placeholder="Libro a buscar..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EE6832] bg-white"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
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

      <datalist id="sugerencias">
        {sugerencias.map((libro) => (
          <option key={libro.id} value={libro.title} />
        ))}
      </datalist>

      {selectedBook && (
        <div className="mt-4 flex justify-center items-center">
          <Libro
            imagen={selectedBook.cover_image_url}
            autor={selectedBook.author}
            titulo={selectedBook.title}
          />
        </div>
      )}
    </div>
  );
});

export default BuscadorAsincrono;

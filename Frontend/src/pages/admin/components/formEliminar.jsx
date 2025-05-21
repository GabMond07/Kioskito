import { useState, useContext, useRef } from "react";
import BuscadorAsincrono from "./buscador";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../../components/ui/Loader";
import { AuthContext } from "../../../context/AuthContext";

function FormEliminar() {
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  const buscadorRef = useRef(); // 🔑 Referencia

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        "http://localhost/Servicio-Php/EliminarLibro",
        {
          data: {
            id: libroSeleccionado.id,
            rol_id: user.id_rol,
            user_id: user.id,
          },
        }
      );
      if (response.data.success) {
        toast.success("Libro eliminado correctamente.");
        setLibroSeleccionado(null);
        buscadorRef.current?.limpiarInput(); //Limpiar input
        setShowModal(false);
      } else {
        toast.error("No se pudo eliminar el libro.");
      }
    } catch (error) {
      console.error("Error al eliminar el libro:", error);
      toast.error("Ocurrió un error al eliminar el libro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!libroSeleccionado) {
      toast.error("Selecciona un libro antes de eliminar.");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <BuscadorAsincrono
          ref={buscadorRef} // 🔑 Pasamos la referencia
          onSeleccion={(book) => setLibroSeleccionado(book)}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors disabled:opacity-50"
        >
          Eliminar libro
        </button>
      </form>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-white/80">
            <h3 className="font-bold text-black/80">Confirmar eliminación</h3>
            <p className="py-4 text-black/80">
              ¿Estás seguro de que deseas eliminar “{libroSeleccionado?.title}”?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-action">
              <button
                className="bg-[#8AB8B3]/80 text-black/80 hover:bg-[#7AA8A3] transition-colors px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors disabled:opacity-50"
                disabled={isLoading}
                onClick={handleDelete}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader /> Eliminando...
                  </div>
                ) : (
                  "Sí, eliminar libro"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormEliminar;

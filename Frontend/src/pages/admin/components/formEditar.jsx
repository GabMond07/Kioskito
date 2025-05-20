import { useState, useContext } from "react";
import BuscadorAsincrono from "./buscador";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../../components/ui/Loader";
import { AuthContext } from "../../../context/AuthContext";
import { useRef } from "react";


function FormEditar() {
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const buscadorRef = useRef(); 

  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    fecha: "",
  });

  const handleSeleccion = (book) => {
    setLibroSeleccionado(book);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!libroSeleccionado) {
      toast.error("Selecciona un libro antes de editar.");
      return;
    }

    setFormData({
      titulo: libroSeleccionado.title || "",
      autor: libroSeleccionado.author || "",
      fecha: libroSeleccionado.date || "",
    });

    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (isSaving) return; // Evitar múltiples envíos

    setIsSaving(true);
    try {
      const payload = {
        id: libroSeleccionado.id,
        title: formData.titulo,
        author: formData.autor,
        date: formData.fecha,
        rol_id: user.id_rol,
      };

      const response = await axios.put(
        "http://localhost/Servicio-Php/EditarLibro",
        payload
      );

      if (response.data.success) {
        toast.success("Libro editado correctamente.");
        setLibroSeleccionado({
          title: formData.titulo,
          author: formData.autor,
          date: formData.fecha,
        });
        setShowModal(false);
        buscadorRef.current?.limpiarInput();
      } else {
        toast.error(response.data.message || "No se pudo editar el libro.");
      }
    } catch (error) {
      console.error("Error al editar el libro:", error);
      toast.error(
        error.response?.data?.message || "Ocurrió un error al editar el libro."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isSaving) {
      setShowModal(false);
    }
  };

  return (
    <div className="p-6">
      <BuscadorAsincrono ref={buscadorRef} onSeleccion={handleSeleccion} />

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors disabled:opacity-50"
      >
        Editar libro
      </button>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-white/90">
            <h3 className="font-bold text-lg mb-4">Editar libro</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  name="titulo"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#EE6832]"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Autor</label>
                <input
                  type="text"
                  name="autor"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#EE6832]"
                  value={formData.autor}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#EE6832]"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] flex items-center justify-center min-w-[120px]"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader size={20} className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormEditar;

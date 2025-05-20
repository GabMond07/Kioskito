import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../../components/ui/Loader";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

function AgregarLibro() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  //Obtiene el id del rol del usuario logueado
  const {user} = useContext(AuthContext);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !author || !date || !file) {
      return alert("Todos los campos son obligatorios, incluyendo la imagen.");
    }

    setIsLoading(true);

    try {
      // 1. Subir imagen a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;

      // 2. Enviar datos al backend PHP
      await axios.post("http://localhost/Servicio-Php/AñadirLibro", {
        title,
        author,
        date,
        cover_image_url: imageUrl,
        file_url: "placeholder.pdf", // Este campo se ignora en backend, pero es obligatorio
        rol_id: user.id_rol
      });

      toast.success("Libro guardado con éxito");

      // Limpiar campos
      setTitle("");
      setAuthor("");
      setDate("");
      setFile("");
    } catch (error) {
      toast.error("Hubo un error al guardar el libro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">Título</label>
          <input
            type="text"
            value={title}
            placeholder="Ingresa el título del libro"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <div>
          <label className="block mb-1">Autor</label>
          <input
            type="text"
            value={author}
            placeholder="Ingresa el nombre del autor"
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <div>
          <label className="block mb-1">Fecha de lanzamiento</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <div>
          <label className="block mb-1">Imagen de la portada</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full bg-white border-gray-300 rounded focus:outline-none focus:border-[#EE6832]"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#EE6832] text-white rounded hover:bg-[#d45a28] transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader />
              Cargando...
            </div>
          ) : (
            "Guardar"
          )}
        </button>
      </form>
    </div>
  );
}

export default AgregarLibro;

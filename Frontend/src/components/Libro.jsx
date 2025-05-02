export default function Libro({ imagen, autor, titulo }) {
    return (
      <div className="w-[148px]">
        <img
          src={imagen}
          alt={titulo}
          className="w-[148px] h-[227px] object-cover rounded shadow"
        />
        <div className="text-sm mt-1">
          <p className="text-gray-800">{autor}</p>
          <p className="text-black font-semibold leading-tight truncate">{titulo}</p>
        </div>
      </div>
    );
  }
  
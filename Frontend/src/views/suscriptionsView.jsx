function SuscriptionsView() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Cliente */}
          <div className="bg-gradient-to-r from-primary to-secondary p-[1px] rounded-xl">
            <div className="bg-white rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 border border-transparent bg-clip-padding">
              <h2 className="text-2xl font-bold text-center mb-2">Suscripción Cliente</h2>
              <p className="text-gray-600 text-center mb-4">
                Ideal para lectores frecuentes que desean disfrutar del mejor contenido.
              </p>
              <ul className="list-disc list-inside text-left text-gray-700 space-y-1">
                <li>Acceso ilimitado a contenido exclusivo</li>
                <li>Descargas sin límites</li>
                <li>Descuentos en publicaciones</li>
                <li>Soporte prioritario</li>
                <li>Actualizaciones automáticas</li>
              </ul>
              <div className="text-3xl font-bold text-primary text-center mt-6">💲99 / mes</div>
              <button className="btn btn-primary w-full mt-4" onClick={()=>document.getElementById('my_modal_3').showModal()}>Suscribirse</button>
              <dialog id="my_modal_3" className="modal">
              <div className="modal-box bg-white rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 border border-transparent bg-clip-padding">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                
              </div>
            </dialog>
            </div>
          </div>
  
          {/* Colaborador */}
          <div className="bg-gradient-to-r from-secondary to-primary p-[1px] rounded-xl">
            <div className="bg-white rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 border border-transparent bg-clip-padding">
              <h2 className="text-2xl font-bold text-center mb-2">Suscripción Colaborador</h2>
              <p className="text-gray-600 text-center mb-4">
                Perfecta para creadores que quieren compartir y monetizar su contenido.
              </p>
              <ul className="list-disc list-inside text-left text-gray-700 space-y-1">
                <li>Publicación de tus propios libros</li>
                <li>Ganancias por visualizaciones</li>
                <li>Promoción dentro de la plataforma</li>
                <li>Estadísticas detalladas</li>
                <li>Asesoría editorial</li>
              </ul>
              <div className="text-3xl font-bold text-secondary text-center mt-6">💲199 / mes</div>
              <button className="btn btn-secondary w-full mt-4">Suscribirse</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SuscriptionsView;
  
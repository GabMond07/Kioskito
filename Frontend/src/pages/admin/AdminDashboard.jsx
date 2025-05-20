import { useState } from "react";
import SidebarAdmin from "./components/sidebar";
import FormEditar from "./components/formEditar";
import FormEliminar from "./components/formEliminar";
import FormAgregar from "./components/formAgregar";

function AdminDashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const renderModal = () => {
    switch (activeModal) {
      case 'agregar':
        return <FormAgregar />
      case 'modificar':
        return <FormEditar />
      case 'eliminar':
        return <FormEliminar />
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarAdmin onButtonClick={setActiveModal} />
      
      {/* Área de contenido/modal */}
      <div className="flex-1 flex items-center justify-center bg-gray-100/50">
        {activeModal && (
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'agregar' && 'Agregar Libro'}
                {activeModal === 'modificar' && 'Modificar Libro'}
                {activeModal === 'eliminar' && 'Eliminar Libro'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>
            {renderModal()}
          </div>
        )}
        
        {/* Contenido por defecto cuando no hay modal */}
        {!activeModal && (
          <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Panel de Administración</h2>
            <p className="text-gray-500">Seleccione una acción del menú lateral</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
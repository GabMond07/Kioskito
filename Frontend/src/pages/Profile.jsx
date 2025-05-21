import React, { useState, useContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_URL = 'https://kioskito-subscription-ws-production.up.railway.app';
const API_URL_ = 'http://localhost:5000';

const stripePromise = loadStripe('pk_test_51RJQpHEIzHcla4R8E8yxC9pPGvikUZwc37BfmQJhvUwhWR2krfi7luoe2n3fpuRerSHG4b5bybHeZF0CYHbXuK6J00dq9Ptk76');

const EditProfileForm = ({ onClose }) => {
  const { user, api } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {};
      if (formData.name && formData.name !== user.name) updateData.name = formData.name;
      if (formData.email && formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      if (Object.keys(updateData).length === 0) {
        setError('No se realizaron cambios.');
        setLoading(false);
        return;
      }

      await api.put(`${API_URL_}/users/${user.id}`, updateData);

      // Recargar los datos del usuario desde el backend
      const response = await api.get(`${API_URL_}/users/${user.id}`);
      localStorage.setItem('user', JSON.stringify(response.data));

      setSuccess(true);
      toast.success('Perfil actualizado exitosamente');
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar la página para reflejar los cambios
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const errorMsg = err.response?.data?.detail || 'Ocurrió un error al actualizar el perfil.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Editar Perfil</h2>
      {success ? (
        <div className="text-green-600 text-center p-6 bg-green-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          ¡Perfil actualizado exitosamente!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (opcional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nueva contraseña"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </form>
      )}
    </div>
  );
};

const RenewSubscriptionForm = ({ onClose, planId }) => {
  const { user, api, checkSubscriptionStatus, setHasActiveSubscription, accessToken } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRenewSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe no se ha cargado correctamente.');
      setLoading(false);
      toast.error('Error con Stripe');
      return;
    }

    try {
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentError) {
        setError(paymentError.message);
        setLoading(false);
        toast.error(paymentError.message);
        return;
      }

      const response = await api.put(`${API_URL}/api/ReactiveSubscription`, {
        userId: user.id,
        planId,
        paymentMethodId: paymentMethod.id,
      });

      if (response.data.success) {
        const subscriptionStatus = await checkSubscriptionStatus(user.id, accessToken);
        setHasActiveSubscription(subscriptionStatus);
        localStorage.setItem('has_active_subscription', subscriptionStatus.toString());
        setSuccess(true);
        toast.success('¡Suscripción renovada exitosamente!');
        setTimeout(() => onClose(), 2000);
      } else {
        setError(response.data.message || 'Error al renovar la suscripción');
        toast.error(response.data.message || 'Error al renovar la suscripción');
      }
    } catch (err) {
      console.error('Error al renovar suscripción:', err);
      const errorMsg = err.response?.data?.message || 'Ocurrió un error al procesar tu pago.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Renovar Suscripción</h2>
      {success ? (
        <div className="text-green-600 text-center p-6 bg-green-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          ¡Suscripción renovada exitosamente!
        </div>
      ) : (
        <form onSubmit={handleRenewSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Información de la Tarjeta</label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <CardElement
                options={{
                  style: {
                    base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
                    invalid: { color: '#ef4444' },
                  },
                }}
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Renovar'}
          </button>
        </form>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, isLoading, hasActiveSubscription, api, checkSubscriptionStatus, setHasActiveSubscription, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(hasActiveSubscription);
  const [cancellationDate, setCancellationDate] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [canceledAt, setCanceledAt] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (user && accessToken) {
        const status = await checkSubscriptionStatus(user.id, accessToken);
        setSubscriptionStatus(status);
        setHasActiveSubscription(status);
        localStorage.setItem('has_active_subscription', status.toString());
        await fetchCancellationDetails();
      }
    };
    fetchStatus();
  }, [user, accessToken, checkSubscriptionStatus, setHasActiveSubscription]);

  const fetchCancellationDetails = async () => {
    try {
      const response = await api.get(`${API_URL_}/users/${user.id}/subscription/cancellation`);
      setCancelAtPeriodEnd(response.data.cancel_at_period_end);
      setCanceledAt(response.data.canceled_at);
      if (response.data.canceled_at) {
        const date = new Date(response.data.canceled_at).toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'America/Chicago',
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }) + ' CST';
        setCancellationDate(date);
      }
    } catch (err) {
      console.error('Error fetching cancellation details:', err);
    }
  };

  const openEditModal = () => {
    document.getElementById('edit_modal').showModal();
  };

  const closeEditModal = () => {
    document.getElementById('edit_modal').close();
  };

  const openRenewModal = () => {
    setSelectedPlan({ id: user?.subscription?.planId || 1 });
    document.getElementById('renew_modal').showModal();
  };

  const closeRenewModal = () => {
    setSelectedPlan(null);
    document.getElementById('renew_modal').close();
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    try {
      const response = await api.put(`${API_URL}/api/CancelSubscriptions`, {
        userId: user.id,
        planId: user?.subscription?.planId || 1,
      });

      if (response.data.success) {
        const status = await checkSubscriptionStatus(user.id, accessToken);
        setHasActiveSubscription(status);
        setSubscriptionStatus(status);
        localStorage.setItem('has_active_subscription', status.toString());
        await fetchCancellationDetails();
        const now = new Date();
        const formattedDate = now.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'America/Chicago',
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }) + ' CST';
        toast.success(
          `Suscripción cancelada exitosamente. Fecha de cancelación: ${formattedDate}`,
          { duration: 5000 }
        );
      } else {
        toast.error(response.data.message || 'Error al cancelar la suscripción');
      }
    } catch (err) {
      console.error('Error al cancelar suscripción:', err);
      toast.error(err.response?.data?.message || 'Ocurrió un error al cancelar');
    }
  };

  const handleWebhookNotification = (event) => {
    if (event.data.type === 'subscription.created') {
      toast.success('¡Tu suscripción ha sido registrada exitosamente!');
      checkSubscriptionStatus(user.id, accessToken).then(status => {
        setHasActiveSubscription(status);
        setSubscriptionStatus(status);
        localStorage.setItem('has_active_subscription', status.toString());
      });
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/webhooks/stripe`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebhookNotification(data);
    };
    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [user, accessToken]);

  if (isLoading || !user) {
    return (
        <div className="flex justify-center items-center min-h-screen"><Loader className="w-16 h-16"/></div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Perfil de {user.name}
          </h1>

          {/* Información del Usuario */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Información Personal</h2>
            <div className="space-y-3">
              <p className="text-gray-600"><strong>Nombre:</strong> {user.name}</p>
              <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
            </div>
            <button
              onClick={openEditModal}
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
            >
              Editar Perfil
            </button>
          </div>

          {/* Gestión de Suscripción */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Gestión de Suscripción</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <strong>Estado:</strong> {subscriptionStatus ? 'Activa' : 'Inactiva'}
              </p>
              {cancellationDate && (
                <p className="text-gray-600">
                  <strong>Fecha de Cancelación:</strong> {cancellationDate}
                </p>
              )}
              {cancelAtPeriodEnd && (
                <p className="text-gray-600">
                  <strong>Cancelación al Final del Período:</strong> Sí
                </p>
              )}
              {canceledAt && (
                <p className="text-gray-600">
                  <strong>Fecha de Cancelación Registrada:</strong> {new Date(canceledAt).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    timeZone: 'America/Chicago',
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  }) + ' CST'}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleCancelSubscription}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white p-3 rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300"
                >
                  Cancelar Suscripción
                </button>
                <button
                  onClick={openRenewModal}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                >
                  Renovar Suscripción
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para Editar Perfil */}
        <dialog id="edit_modal" className="modal">
          <div className="modal-box max-w-lg p-0 bg-transparent">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                onClick={closeEditModal}
              >
                ✕
              </button>
            </form>
            <EditProfileForm onClose={closeEditModal} />
          </div>
        </dialog>

        {/* Modal para Renovar Suscripción */}
        <dialog id="renew_modal" className="modal">
          <div className="modal-box max-w-lg p-0 bg-transparent">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                onClick={closeRenewModal}
              >
                ✕
              </button>
            </form>
            <RenewSubscriptionForm onClose={closeRenewModal} planId={user?.subscription?.planId || 1} />
          </div>
        </dialog>
      </div>
    </Elements>
  );
};

export default Profile;
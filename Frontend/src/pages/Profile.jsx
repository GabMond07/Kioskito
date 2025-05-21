import React, { useState, useContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_URL = 'https://kioskito-subscription-ws-production.up.railway.app';

const stripePromise = loadStripe('pk_test_51RJQpHEIzHcla4R8E8yxC9pPGvikUZwc37BfmQJhvUwhWR2krfi7luoe2n3fpuRerSHG4b5bybHeZF0CYHbXuK6J00dq9Ptk76');

const RenewSubscriptionForm = ({ onClose, planId }) => {
  const { user, api, checkSubscriptionStatus, setHasActiveSubscription, accessToken } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethodId, setPaymentMethodId] = useState('');
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

      setPaymentMethodId(paymentMethod.id);

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
        setTimeout(() => {
          onClose();
        }, 2000);
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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(hasActiveSubscription);

  useEffect(() => {
    const fetchStatus = async () => {
      if (user && accessToken) {
        const status = await checkSubscriptionStatus(user.id, accessToken);
        setSubscriptionStatus(status);
        setHasActiveSubscription(status);
        localStorage.setItem('has_active_subscription', status.toString());
      }
    };
    fetchStatus();
  }, [user, accessToken, checkSubscriptionStatus, setHasActiveSubscription]);

//   useEffect(() => {
//     if (hasActiveSubscription) {
//       navigate('/home');
//     }
//   }, [hasActiveSubscription, navigate]);

  const openRenewModal = () => {
    setSelectedPlan({ id: user?.subscription?.planId || 1 }); // Ajustar según estructura de user
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
        planId: user?.subscription?.planId || 1, // Ajustar según estructura de user
      });

      if (response.data.success) {
        const status = await checkSubscriptionStatus(user.id, accessToken);
        setHasActiveSubscription(status);
        localStorage.setItem('has_active_subscription', status.toString());
        toast.success('Suscripción cancelada exitosamente');
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
        localStorage.setItem('has_active_subscription', status.toString());
      });
    }
  };

  useEffect(() => {
    // Simular webhook (en producción, esto vendría del backend)
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
      <div className="min-h-screen flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
        </svg>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Perfil de {user.name}</h1>
          <div className="space-y-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Suscripción:</strong> {subscriptionStatus ? 'Activa' : 'Inactiva'}</p>
            {subscriptionStatus ? (
              <button
                onClick={handleCancelSubscription}
                className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 mb-4"
              >
                Cancelar Suscripción
              </button>
            ) : (
              <button
                onClick={openRenewModal}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 mb-4"
              >
                Renovar Suscripción
              </button>
            )}
          </div>
        </div>
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
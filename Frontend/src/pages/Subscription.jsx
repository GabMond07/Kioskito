import React, { useState, useContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_URL = 'https://kioskito-subscription-ws-production.up.railway.app';

const stripePromise = loadStripe('pk_test_51RJQpHEIzHcla4R8E8yxC9pPGvikUZwc37BfmQJhvUwhWR2krfi7luoe2n3fpuRerSHG4b5bybHeZF0CYHbXuK6J00dq9Ptk76');

const SubscriptionForm = ({ selectedPlan, onClose }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });
  const { user, api, checkSubscriptionStatus, setHasActiveSubscription, accessToken } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [planId, setPlanId] = useState(selectedPlan?.id || 1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const plans = [
    { id: 1, name: 'Cliente', price: '$99/mes' },
    { id: 2, name: 'Colaborador', price: '$199/mes' },
  ];

  useEffect(() => {
    if (selectedPlan) {
      setPlanId(selectedPlan.id);
    }
    console.log('SubscriptionForm montado con user:', user);
  }, [selectedPlan, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Debes iniciar sesión para suscribirte.');
      setLoading(false);
      toast.error('Usuario no autenticado');
      navigate('/');
      return;
    }

    if (!cardholderName || !billingAddress.line1 || !billingAddress.city || !billingAddress.state || !billingAddress.postal_code) {
      setError('Por favor, completa todos los campos obligatorios.');
      setLoading(false);
      toast.error('Campos incompletos');
      return;
    }

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
        billing_details: {
          name: cardholderName,
          address: billingAddress,
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        setLoading(false);
        toast.error(paymentError.message);
        return;
      }

      console.log('Enviando solicitud de suscripción:', { userId: user.id, planId, paymentMethodId: paymentMethod.id });
      const response = await api.post(`${API_URL}/api/CreateSubscriptions`, {
        userId: user.id,
        planId: planId,
        paymentMethodId: paymentMethod.id,
      });

      if (response.data.success) {
        // Actualizar estado de suscripción
        if (accessToken) {
          const subscriptionStatus = await checkSubscriptionStatus(user.id, accessToken);
          setHasActiveSubscription(subscriptionStatus);
          localStorage.setItem('has_active_subscription', subscriptionStatus.toString());
        } else {
          console.warn('No accessToken available, assuming subscription is active');
          setHasActiveSubscription(true);
          localStorage.setItem('has_active_subscription', 'true');
        }

        setSuccess(true);
        toast.success('¡Suscripción creada exitosamente!');
        setTimeout(() => {
          onClose();
          navigate('/home');
        }, 2000);
      } else {
        setError(response.data.message || 'Error al crear la suscripción');
        toast.error(response.data.message || 'Error al crear la suscripción');
      }
    } catch (err) {
      console.error('Error al procesar suscripción:', err);
      const errorMsg = err.response?.data?.message || 'Ocurrió un error al procesar tu pago.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Suscribirse a {plans.find((plan) => plan.id === planId)?.name}
      </h2>
      
      {success ? (
        <div className="text-green-600 text-center p-6 bg-green-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          ¡Suscripción creada exitosamente!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Seleccionado</label>
            <div className="w-full p-3 bg-gray-100 rounded-lg text-gray-800">
              {plans.find((plan) => plan.id === planId)?.name} - {plans.find((plan) => plan.id === planId)?.price}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Titular</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Información de la Tarjeta</label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      '::placeholder': { color: '#9ca3af' },
                    },
                    invalid: { color: '#ef4444' },
                  },
                }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Dirección de Facturación</label>
            <input
              type="text"
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
              placeholder="123 Main St"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                placeholder="Ciudad"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                placeholder="Estado"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <input
              type="text"
              value={billingAddress.postal_code}
              onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
              placeholder="Código Postal"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                Procesando...
              </span>
            ) : (
              'Suscribirse'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

const Subscription = () => {
  const { user, isLoading, hasActiveSubscription } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    { id: 1, name: 'Cliente', price: '$99/mes' },
    { id: 2, name: 'Colaborador', price: '$199/mes' },
  ];

  useEffect(() => {
    console.log('Subscription montado con user:', user, 'hasActiveSubscription:', hasActiveSubscription);
    if (hasActiveSubscription) {
      navigate('/home');
    }
  }, [hasActiveSubscription, navigate, user]);

  const openModal = (planId) => {
    setSelectedPlan(plans.find((plan) => plan.id === planId));
    document.getElementById('subscription_modal').showModal();
  };

  const closeModal = () => {
    setSelectedPlan(null);
    document.getElementById('subscription_modal').close();
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-[1px] rounded-xl">
            <div className="bg-white rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300">
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
              <div className="text-3xl font-bold text-blue-600 text-center mt-6">$99 / mes</div>
              <button
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 mt-4"
                onClick={() => openModal(1)}
              >
                Suscribirse
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-[1px] rounded-xl">
            <div className="bg-white rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300">
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
              <div className="text-3xl font-bold text-purple-600 text-center mt-6">$199 / mes</div>
              <button
                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 mt-4"
                onClick={() => openModal(2)}
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>
        <dialog id="subscription_modal" className="modal">
          <div className="modal-box max-w-lg p-0 bg-transparent">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                onClick={closeModal}
              >
                ✕
              </button>
            </form>
            <SubscriptionForm selectedPlan={selectedPlan} onClose={closeModal} />
          </div>
        </dialog>
      </div>
    </Elements>
  );
};

export default Subscription;
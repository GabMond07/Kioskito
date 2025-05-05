import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext'; // Asegúrate de ajustar la ruta según tu estructura

const API_URL = 'https://localhost:7024'

const stripePromise = loadStripe('pk_test_51RJQpHEIzHcla4R8E8yxC9pPGvikUZwc37BfmQJhvUwhWR2krfi7luoe2n3fpuRerSHG4b5bybHeZF0CYHbXuK6J00dq9Ptk76'); // Reemplaza con tu clave pública de Stripe

const SubscriptionForm = () => {
  const { user, api } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [planId, setPlanId] = useState(1); // ID del plan por defecto
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // console.log('user:', user); 

  const plans = [
    { id: 1, name: 'Plan Básico', price: '$9.99/mes' },
    { id: 2, name: 'Plan Premium', price: '$19.99/mes' },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Debes iniciar sesión para suscribirte.');
      setLoading(false);
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe no se ha cargado correctamente.');
      setLoading(false);
      return;
    }

    try {
      // Crear método de pago
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentError) {
        setError(paymentError.message);
        setLoading(false);
        return;
      }

      // Enviar solicitud de suscripción al backend
      const response = await api.post(`${API_URL}/api/Subscriptions`, {
        userId: user.id,
        planId: planId,
        paymentMethodId: paymentMethod.id,
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Ocurrió un error al procesar tu pago.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Suscribirse a un Plan</h2>
      
      {success ? (
        <div className="text-green-600 text-center">
          ¡Suscripción creada exitosamente!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Selección de Plan */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Seleccionar Plan</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(Number(e.target.value))}
              className="mt-1 ajustar w-full p-2 border border-gray-300 rounded-md"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price}
                </option>
              ))}
            </select>
          </div>

          {/* Entrada de Tarjeta */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Información de la Tarjeta</label>
            <div className="mt-1 p-2 border border-gray-300 rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#fa755a',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="text-red-600 mb-4 text-sm">{error}</div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={!stripe || loading || !user}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Suscribirse'}
          </button>
        </form>
      )}
    </div>
  );
};

const Subscription = () => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm />
    </Elements>
  );
};

export default Subscription;
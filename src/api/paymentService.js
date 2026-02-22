import api from './axios';

const PaymentService = {
    // Create a new UPI order
    createOrder: async (amount) => {
        try {
            const response = await api.post('/users/payments/create/', { amount });
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Handle payment success (Simulated Webhook Call)
    simulateSuccess: async (orderId, paymentId) => {
        try {
            const response = await api.post('/users/payments/webhook/', {
                order_id: orderId,
                payment_id: paymentId,
                success: true
            });
            return response.data;
        } catch (error) {
            console.error('Error simulating success:', error);
            throw error;
        }
    },

    // Get payment history
    getPaymentHistory: async () => {
        try {
            const response = await api.get('/users/payments/');
            return response.data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    }
};

export default PaymentService;

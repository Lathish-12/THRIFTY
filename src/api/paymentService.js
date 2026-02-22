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

    // Verify payment signature with backend (Step 4 & 5)
    verifyPayment: async (orderId, paymentId, signature) => {
        try {
            const response = await api.post('/users/payments/verify/', {
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
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

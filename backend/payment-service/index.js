import express from 'express';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import dotenv  from 'dotenv'; 
import UserRestaurantPayment from './models/UserRestaurantPayment.js';
import DriverPayment from './models/DriverPayment.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const YOUR_DOMAIN = 'http://localhost:4242';

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

  
  // backend/app.post('/create-checkout-session', ...)


app.post('/create-checkout-session', async (req, res) => {
  const { 
    amount, 
    currency = 'usd', 
    name = 'Cart Items', 
    quantity = 1, 
    customerId, 
    orderId, 
    restaurantId, 
    deliveryFee, 
    driverId, 
    paymentType = 'card' 
  } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/customer`, 
      cancel_url: `http://localhost:3000/payment/disclaimer?orderId=${orderId}`,
    });

    // Save payment data as before
    await UserRestaurantPayment.create({
      customerId,
      orderId,
      restaurantId,
      orderTotal: amount,
      sessionUrl: session.url,
    });

    await DriverPayment.create({
      driverId,
      deliveryFee,
      paymentType,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// 📊 Utility Methods
app.get('/total-order-payments', async (req, res) => {
  const total = await UserRestaurantPayment.aggregate([
    { $group: { _id: null, total: { $sum: "$orderTotal" } } }
  ]);
  res.json({ total: total[0]?.total || 0 });
});

app.get('/order-total/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = await UserRestaurantPayment.findOne({ orderId });
  res.json({ total: order?.orderTotal || 0 });
});

app.get('/total-delivery-fee', async (req, res) => {
  const total = await DriverPayment.aggregate([
    { $group: { _id: null, total: { $sum: "$deliveryFee" } } }
  ]);
  res.json({ total: total[0]?.total || 0 });
});

app.get('/driver-total/:driverId', async (req, res) => {
  const { driverId } = req.params;
  const total = await DriverPayment.aggregate([
    { $match: { driverId } },
    { $group: { _id: null, total: { $sum: "$deliveryFee" } } }
  ]);
  res.json({ total: total[0]?.total || 0 });
});

app.get('/', (req, res) => {
  res.send('Stripe payment gateway with MongoDB logging is running!');
});

app.get('/payment-url/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    console.log('Finding payment with orderId:', orderId); // Log the orderId being queried
    const payment = await UserRestaurantPayment.findOne({ orderId: orderId.trim() });

    if (!payment) {
      console.error(`No payment record found for orderId: ${orderId}`); // Log missing record
      return res.status(404).json({ error: 'Payment record not found for this order' });
    }

    console.log('Payment record found:', payment); // Log the retrieved record

    if (!payment.sessionUrl) {
      console.error(`sessionUrl is missing for orderId: ${orderId}`); // Log missing sessionUrl
      return res.status(404).json({ error: 'Payment session URL not stored for this order' });
    }

    return res.status(200).json({ url: payment.sessionUrl });
  } catch (error) {
    console.error('Error fetching session URL:', error);
    res.status(500).json({ error: 'Failed to fetch session URL' });
  }
});

// 📊 Utility Methods
// Get all UserRestaurantPayment records in a table format
app.get('/user-restaurant-payments', async (req, res) => {
  try {
    const payments = await UserRestaurantPayment.find({}, { sessionUrl: 0, __v: 0 }); // Exclude sessionUrl and __v

    // Format the data to match the frontend table structure
    const formattedPayments = payments.map(payment => ({
      userId: payment.customerId,
      restaurantId: payment.restaurantId,
      amount: payment.orderTotal,
      date: new Date(payment.createdAt).toLocaleDateString(), // Format createdAt as MM/DD/YYYY
    }));

    res.status(200).json({ payments: formattedPayments });
  } catch (error) {
    console.error('Error fetching UserRestaurantPayment records:', error);
    res.status(500).json({ error: 'Failed to fetch UserRestaurantPayment records' });
  }
});


// Get all DriverPayment records in a table format
app.get('/driver-payments', async (req, res) => {
  try {
    const payments = await DriverPayment.find({}, { __v: 0 }); // Exclude __v field

    // Format the data to match the frontend table structure
    const formattedPayments = payments.map(payment => ({
      driverId: payment.driverId,
      deliveryFee: payment.deliveryFee,
      paymentType: payment.paymentType,
      date: new Date(payment.createdAt).toLocaleDateString(), // Format createdAt as MM/DD/YYYY
    }));

    res.status(200).json({ payments: formattedPayments });
  } catch (error) {
    console.error('Error fetching DriverPayment records:', error);
    res.status(500).json({ error: 'Failed to fetch DriverPayment records' });
  }
});

// Get the highest orderTotal from UserRestaurantPayment
app.get('/highest-order-total', async (req, res) => {
  try {
    const highestOrder = await UserRestaurantPayment.findOne().sort({ orderTotal: -1 }).limit(1);
    if (!highestOrder) {
      return res.status(404).json({ error: 'No orders found' });
    }
    res.status(200).json({ highestOrderTotal: highestOrder.orderTotal, orderId: highestOrder.orderId });
  } catch (error) {
    console.error('Error fetching highest order total:', error);
    res.status(500).json({ error: 'Failed to fetch highest order total' });
  }
});

// Get the highest deliveryFee from DriverPayment
app.get('/highest-delivery-fee', async (req, res) => {
  try {
    const highestDelivery = await DriverPayment.findOne().sort({ deliveryFee: -1 }).limit(1);
    if (!highestDelivery) {
      return res.status(404).json({ error: 'No deliveries found' });
    }
    res.status(200).json({ highestDeliveryFee: highestDelivery.deliveryFee, driverId: highestDelivery.driverId });
  } catch (error) {
    console.error('Error fetching highest delivery fee:', error);
    res.status(500).json({ error: 'Failed to fetch highest delivery fee' });
  }
});



// 🚀 Start Server
const PORT = 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
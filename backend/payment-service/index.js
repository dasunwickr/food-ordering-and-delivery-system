import express from 'express';
import Stripe from 'stripe';
import { config } from 'dotenv';

config(); // Load environment variables from .env

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const app = express();
app.use(express.json());

const YOUR_DOMAIN = 'http://localhost:4242';

// 🎯 POST route to create checkout session using dynamic price
app.post('/create-checkout-session', async (req, res) => {
  const { amount, currency = 'usd', name = 'Cart Items', quantity = 1 } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid or missing amount' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/', (req, res) => {
  res.send('Stripe dynamic payment gateway is running!');
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

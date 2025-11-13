import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint to proxy Claude requests
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Stripe checkout endpoint
app.post('/api/create-checkout', async (req, res) => {
  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'success_url': `${req.body.origin}?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': req.body.origin,
        'mode': 'subscription',
        'line_items[0][price]': process.env.STRIPE_PRICE_ID,
        'line_items[0][quantity]': '1'
      })
    });

    const session = await response.json();
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify payment endpoint
app.get('/api/verify-payment', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    });

    const session = await response.json();
    res.json({ 
      paid: session.payment_status === 'paid',
      subscription: session.subscription
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

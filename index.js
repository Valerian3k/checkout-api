import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://wojtasm.pl"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.options(/.*/, cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { quantity = 1, delivery = "standard" } = req.body;

    const deliveryPrices = {
      standard: 5,
      express: 10,
      premium: 15,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Vitamin C Serum",
            },
            unit_amount: 2900,
          },
          quantity,
        },
      ],

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: deliveryPrices[delivery] * 100,
              currency: "usd",
            },
            display_name: delivery,
          },
        },
      ],

      success_url: "https://wojtasm.pl/vallora",
      cancel_url: "https://wojtasm.pl/vallora",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

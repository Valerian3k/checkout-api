import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://wojtasm.pl"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.options("*", cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { quantity, delivery } = req.body;

  const deliveryPrices = {
    standard: 5,
    express: 10,
    premium: 15,
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "link", "blik"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Vitamin C Serum",
          },
          unit_amount: 2900,
        },
        quantity: 1,
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
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  res.json({ url: session.url });
});

app.get("/", (req, res) => {
  res.json({ ok: true });
});

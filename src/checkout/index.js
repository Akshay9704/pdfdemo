import React from "react";
import { loadSripe } from "@stripe/stripe-js"; // Load Stripe library
import { callStripeSession } from "../backend/services/stripe";

const Checkout = () => {
  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY; // GET FROM STRIPE
  const stripePromise = loadSripe(publishableKey); // Load Stripe with the publishable key
  const handleCheckout = async () => {
    const stripe = await stripePromise; // Initialize Stripe
    const createLineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: item.price * 100, // Convert to cents
      },
      quantity: item.quantity,
    }));

    const res = await callStripeSession(createLineItems); // Call the backend service to create a Stripe session
  };
  return (
    <div>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default Checkout;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.stripePayment = async (req, res) => {
  const AuthUser = null; // Placeholder for the authentication function
  try {
    const isAuthUser = await AuthUser(req);
    if (!isAuthUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const res = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: res, // CART ITEMS
      mode: "payment", // Can be 'payment', 'setup', or 'subscription'
      success_url: `${req.headers.origin}/success`, // Where to redirect after payment success
      cancel_url: `${req.headers.origin}/cancel`, // Where to redirect after payment cancellation
    });

    return res.status(200).json({ id: session.id, success: true });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

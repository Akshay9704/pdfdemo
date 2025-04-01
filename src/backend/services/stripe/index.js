import Cookies from "js-cookie";

export const callStripeSession = async (formData) => {
  try {
    const response = await fetch("/api/stripe", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    throw new Error("Internal server error");
  }
};

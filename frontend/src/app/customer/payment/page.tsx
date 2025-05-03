"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    amount: "",
    customerId: "",
    orderId: "",
    restaurantId: "",
    deliveryFee: "",
    driverId: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:4242/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          deliveryFee: parseFloat(formData.deliveryFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/customer/payment/disclaimer?orderId=${formData.orderId}`);

      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-6">Checkout Form</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="customerId"
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="orderId"
          placeholder="Order ID"
          value={formData.orderId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="restaurantId"
          placeholder="Restaurant ID"
          value={formData.restaurantId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="deliveryFee"
          placeholder="Delivery Fee"
          value={formData.deliveryFee}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="driverId"
          placeholder="Driver ID"
          value={formData.driverId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 rounded mt-4"
        >
          Checkout
        </button>
      </form>
    </div>
  );
}

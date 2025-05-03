"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DisclaimerPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing in the URL.");
      return;
    }

    setLoading(true);
    fetch(`http://localhost:4242/payment-url/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch payment URL");
        }
        return res.json();
      })
      .then((data) => {
        setCheckoutUrl(data.url);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCheckoutUrl(null);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-6">Disclaimer</h1>
      <p className="mb-4 text-gray-700">
        Please review your order and proceed to payment. By clicking "Proceed to Checkout", you agree to our terms and conditions.
      </p>
      {loading && <p>Loading checkout link...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mt-4"
        >
          Proceed to Checkout
        </a>
      )}
    </div>
  );
}

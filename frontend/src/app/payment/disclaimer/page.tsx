"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing in the URL.")
      setLoading(false)
      return
    }

    fetch(`http://localhost:4242/payment-url/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to retrieve payment link.")
        }
        return res.json()
      })
      .then((data) => {
        setCheckoutUrl(data.url)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setCheckoutUrl(null)
      })
      .finally(() => setLoading(false))
  }, [orderId])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Payment Disclaimer</h1>

        <p className="text-gray-700 mb-6 text-center">
          Please review the following information before proceeding to payment. By continuing, you agree to the terms
          and conditions of this transaction.
        </p>

        <div className="text-sm text-gray-800 mb-8 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Terms and Conditions for Payment Processing</h2>
          <p className="mb-4">
            By using our food delivery platform (the "App") and making payments through Stripe, you (the "User" – either
            as a customer or a restaurant partner) agree to the following terms and conditions regarding payments and
            transaction handling.
          </p>

          <h3 className="font-semibold mt-4 mb-2">1. Payment Gateway Integration</h3>
          <p className="mb-2">1.1 All payments on the App are securely processed through Stripe, a third-party payment gateway.</p>
          <p className="mb-2">1.2 By making a payment, you agree to Stripe's own Terms of Service and Privacy Policy.</p>
          <p className="mb-4">1.3 We do not store your full card details on our servers. Stripe handles all sensitive financial data.</p>

          <h3 className="font-semibold mt-4 mb-2">2. Transaction Recording and Monitoring</h3>
          <p className="mb-2">
            2.1 All payment transactions between customers and restaurants are recorded and stored securely for
            performance analysis, fraud prevention, and service improvement.
          </p>
          <p className="mb-2">
            2.2 The App administrators retain access to view transactional data, including order value, restaurant name,
            customer details (such as name and address), and timestamps.
          </p>
          <p className="mb-2">2.3 This data is used strictly for:</p>
          <ul className="list-disc pl-8 mb-4">
            <li>Improving platform performance.</li>
            <li>Enhancing the recommendation and delivery experience.</li>
            <li>Ensuring transparency and resolving disputes.</li>
            <li>Detecting unusual activity or fraudulent transactions.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">3. Data Privacy and Use</h3>
          <p className="mb-2">
            3.1 All transaction data is processed in accordance with our [Privacy Policy] and in compliance with
            applicable data protection laws (e.g., GDPR, CCPA).
          </p>
          <p className="mb-2">
            3.2 No financial information such as card numbers, CVVs, or bank credentials are accessible to the App
            administrators.
          </p>
          <p className="mb-4">
            3.3 We will never sell or share your personal or transactional data to third parties without your explicit
            consent, except when legally required.
          </p>

          <h3 className="font-semibold mt-4 mb-2">4. Refunds and Disputes</h3>
          <p className="mb-2">
            4.1 Refund requests are subject to the refund policies of individual restaurants and Stripe's processing
            capabilities.
          </p>
          <p className="mb-4">
            4.2 If a customer or restaurant disputes a transaction, the administrators will use the recorded data to
            investigate and facilitate resolution.
          </p>

          <h3 className="font-semibold mt-4 mb-2">5. Compliance and Consent</h3>
          <p className="mb-2">
            5.1 By using the App and making payments via Stripe, you explicitly consent to the monitoring and recording
            of your transaction data by the App administrators.
          </p>
          <p className="mb-4">
            5.2 You must ensure that your account information is accurate and up-to-date to avoid payment failures or
            fraudulent activity.
          </p>

          <h3 className="font-semibold mt-4 mb-2">6. Changes to Terms</h3>
          <p className="mb-4">
            6.1 We reserve the right to modify these terms at any time. Continued use of the App after changes implies
            your acceptance of the revised terms.
          </p>
        </div>

        <div className="text-center">
          {loading && <p className="text-gray-500">Loading payment link...</p>}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {checkoutUrl && (
            <a
              href={checkoutUrl}
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition duration-200"
            >
              Proceed to Checkout
            </a>
          )}

          {!loading && !checkoutUrl && !error && (
            <p className="text-gray-500">No payment link available.</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Your payment is securely processed through our payment gateway.
      </div>
    </div>
  )
}

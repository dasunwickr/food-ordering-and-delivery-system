import { type NextRequest, NextResponse } from "next/server"

const ORDER_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost/api/order-service/order"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['customerId', 'restaurantId', 'customerName', 'customerContact', 'longitude', 'latitude', 'paymentType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Call the order service API
    const response = await fetch(`${ORDER_API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Order service error:", errorData);
      throw new Error(`Error creating order: ${response.status} - ${errorData}`);
    }

    const data = await response.json()

    // Clear the cart using cart service API (optional)
    if (data && data.orderId) {
      try {
        await fetch(`/api/cart/clear/${body.customerId}/${body.restaurantId}`, {
          method: "DELETE",
        })
      } catch (cartError) {
        console.error("Error clearing cart:", cartError)
        // Continue with order creation even if cart clearing fails
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating order:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

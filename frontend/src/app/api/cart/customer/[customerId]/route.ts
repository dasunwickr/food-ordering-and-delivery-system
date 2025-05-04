import { type NextRequest, NextResponse } from "next/server"

// Base URL for the backend API
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost/api/cart-service"

export async function GET(request: NextRequest, { params }: { params: { customerId: string } }) {
  const { customerId } = params

  // Validate customerId
  if (!customerId) {
    return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
  }

  try {
    // Log the base URL for debugging purposes
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not set. Using default URL:", BASE_URL)
    }

    // Fetch all carts for the customer from the backend
    // This matches the Spring Boot endpoint format you shared
    const response = await fetch(`${BASE_URL}/customer/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Don't cache this request
    })

    // Check if the response is successful
    if (!response.ok) {
      const errorDetails = await response.text() // Attempt to extract error details
      console.error(`Backend error: ${response.status} - ${errorDetails}`)
      throw new Error(`Error fetching customer carts: ${response.status} - ${errorDetails}`)
    }

    // Parse and return the carts data
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching customer carts:", error)

    // Return a user-friendly error message
    return NextResponse.json({ error: "Failed to fetch customer carts. Please try again later." }, { status: 500 })
  }
}

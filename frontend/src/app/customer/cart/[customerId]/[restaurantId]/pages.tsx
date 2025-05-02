"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CartPage() {
  const params = useParams()
  const { customerId, cartId } = params

  // Mock cart data — replace with API call later
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Cheeseburger",
      quantity: 2,
      price: 9.99,
      restaurant: "Burger Palace"
    },
    {
      id: 2,
      name: "Fries",
      quantity: 1,
      price: 4.99,
      restaurant: "Burger Palace"
    },
  ])

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.restaurant}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Qty: {item.quantity}</Badge>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-end space-y-4">
          <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
          <Button size="lg" className="w-full sm:w-auto">Proceed to Checkout</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
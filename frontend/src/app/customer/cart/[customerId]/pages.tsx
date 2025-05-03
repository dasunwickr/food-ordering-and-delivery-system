"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Define types matching the API response
interface CartItem {
  itemId: string
  itemName: string
  quantity: number
  potionSize: string
  price: number
  totalPrice: number
  image: string
}

interface Cart {
  id: string
  customerId: string
  restaurantId: string
  items: CartItem[]
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export default function CustomerCartPage({ params }: { params: { customerId: string } }) {
  const { customerId } = params
  const router = useRouter()
  const [carts, setCarts] = useState<Cart[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all carts for the customer
  useEffect(() => {
    async function fetchCarts() {
      try {
        setIsLoading(true)
        const response = await axios.get<Cart[]>(`/api/cart/customer/${customerId}`)
        // Filter out carts with invalid restaurantId like "NaN"
        const validCarts = response.data.filter(cart => cart.restaurantId && cart.restaurantId !== "NaN")
        setCarts(validCarts)
      } catch (error) {
        console.error("Failed to fetch carts:", error)
        toast({
          title: "Error",
          description: "Could not load your carts. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarts()
  }, [customerId])

  // Clear a specific cart
  const clearCart = async (cart: Cart) => {
    const confirm = window.confirm(`Are you sure you want to clear the cart for restaurant ${cart.restaurantId}?`)
    if (!confirm) return

    try {
      await axios.delete(`/api/cart/clear/${customerId}/${cart.restaurantId}`)
      setCarts(prev => prev.filter(c => c.id !== cart.id))
      toast({
        title: "Success",
        description: "Cart cleared successfully"
      })
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast({
        title: "Error",
        description: "Could not clear cart. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Navigate to checkout for a specific cart
  const handleCheckout = (restaurantId: string) => {
    router.push(`/checkout/${customerId}/${restaurantId}`)
  }

  // Handle continue shopping
  const handleContinueShopping = () => {
    router.push("/menu")
  }

  // Skeleton loader UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Carts</h1>
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map(j => (
                  <div key={j} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/5" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Carts</h1>

      {carts.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No active carts found</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your carts yet.</p>
          <Button onClick={handleContinueShopping}>Browse Menu</Button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {carts.map((cart) => (
            <Card key={cart.id}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Restaurant: {cart.restaurantId}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Updated: {new Date(cart.updatedAt).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.items.length === 0 ? (
                  <p className="text-center text-muted-foreground">This cart is empty.</p>
                ) : (
                  <ul className="space-y-4">
                    {cart.items.map(item => (
                      <li key={item.itemId} className="flex items-center gap-4 border-b pb-2">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.itemName}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.itemName}</h3>
                          <p className="text-sm text-muted-foreground">Size: {item.potionSize}</p>
                          <p className="text-sm">
                            ${item.price.toFixed(2)} × {item.quantity} = ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2">
                <span className="font-semibold">
                  Total: ${cart.totalPrice.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCheckout(cart.restaurantId)}
                    disabled={cart.items.length === 0}
                  >
                    Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => clearCart(cart)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* Continue Shopping Button */}
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={handleContinueShopping}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
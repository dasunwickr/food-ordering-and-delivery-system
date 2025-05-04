"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types for cart data
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

// Base URL for the backend API
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost/api/cart-service"

export default function CustomerCartPage({ params }: { params: { customerId: string } }) {
  const { customerId } = params
  const router = useRouter()
  const [carts, setCarts] = useState<Cart[]>([])
  const [activeCartId, setActiveCartId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const fetchCarts = async () => {
    try {
      setIsLoading(true)

      // Log the base URL for debugging purposes
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        console.warn("NEXT_PUBLIC_BACKEND_URL is not set. Using default URL:", BASE_URL)
      }

      const response = await axios.get<Cart[]>(`${BASE_URL}/cart/customer/${customerId}`)
      const fetchedCarts = response.data

      setCarts(fetchedCarts)

      // Set the first cart with items as active, or just the first cart if none have items
      const cartWithItems = fetchedCarts.find((cart) => cart.items.length > 0)
      setActiveCartId(cartWithItems?.id || (fetchedCarts.length > 0 ? fetchedCarts[0].id : ""))
    } catch (error) {
      console.error("Error fetching carts:", error)
      toast({
        title: "Error",
        description: "Failed to load carts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemQuantity = async (cartId: string, itemId: string, newQuantity: number) => {
    try {
      // Find the cart and restaurant ID
      const cart = carts.find((c) => c.id === cartId)
      if (!cart) return

      await axios.put(`${BASE_URL}/cart/update/${customerId}/${cart.restaurantId}/${itemId}`, {
        newQuantity,
      })

      setCarts((prevCarts) => {
        return prevCarts.map((cart) => {
          if (cart.id === cartId) {
            const updatedItems = cart.items
              .map((item) => {
                if (item.itemId === itemId) {
                  const updatedItem = {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: item.price * newQuantity,
                  }
                  return updatedItem
                }
                return item
              })
              .filter((item) => item.quantity > 0)

            const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)

            return {
              ...cart,
              items: updatedItems,
              totalPrice: newTotalPrice,
            }
          }
          return cart
        })
      })

      toast({
        title: "Success",
        description: "Cart updated successfully",
      })
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (cartId: string, itemId: string) => {
    try {
      // Find the cart and restaurant ID
      const cart = carts.find((c) => c.id === cartId)
      if (!cart) return

      await axios.delete(`${BASE_URL}/cart/remove/${customerId}/${cart.restaurantId}/${itemId}`)

      setCarts((prevCarts) => {
        return prevCarts.map((cart) => {
          if (cart.id === cartId) {
            const updatedItems = cart.items.filter((item) => item.itemId !== itemId)
            const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)

            return {
              ...cart,
              items: updatedItems,
              totalPrice: newTotalPrice,
            }
          }
          return cart
        })
      })

      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearCart = async (cartId: string) => {
    if (!window.confirm("Are you sure you want to clear this cart?")) {
      return
    }

    try {
      // Find the cart and restaurant ID
      const cart = carts.find((c) => c.id === cartId)
      if (!cart) return

      await axios.delete(`${BASE_URL}/cart/clear/${customerId}/${cart.restaurantId}`)

      setCarts((prevCarts) => {
        return prevCarts.map((cart) => {
          if (cart.id === cartId) {
            return {
              ...cart,
              items: [],
              totalPrice: 0,
            }
          }
          return cart
        })
      })

      toast({
        title: "Success",
        description: "Cart cleared successfully",
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContinueShopping = (restaurantId: string) => {
    router.push(`/customer/restaurant/${restaurantId}`)
  }

  const handleCheckout = (restaurantId: string) => {
    router.push(`/checkout/${customerId}/${restaurantId}`)
  }

  useEffect(() => {
    fetchCarts()
  }, [customerId])

  // Get the active cart
  const activeCart = carts.find((cart) => cart.id === activeCartId)

  // Calculate additional fees for the active cart
  const deliveryFee = activeCart?.totalPrice ? activeCart.totalPrice * 0.05 : 0
  const tax = activeCart?.totalPrice ? activeCart.totalPrice * 0.08 : 0
  const totalAmount = activeCart?.totalPrice ? activeCart.totalPrice + deliveryFee + tax : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/5" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </Card>
          </div>
        ) : carts.length === 0 || carts.every((cart) => cart.items.length === 0) ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button onClick={() => router.push("/restaurants")}>Browse Restaurants</Button>
          </div>
        ) : (
          <>
            {carts.filter((cart) => cart.items.length > 0).length > 1 && (
              <Tabs value={activeCartId} onValueChange={setActiveCartId} className="mb-6">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {carts
                    .filter((cart) => cart.items.length > 0)
                    .map((cart) => (
                      <TabsTrigger key={cart.id} value={cart.id}>
                        Restaurant {cart.restaurantId.substring(0, 4)}...
                      </TabsTrigger>
                    ))}
                </TabsList>
              </Tabs>
            )}

            {activeCart && activeCart.items.length > 0 ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Restaurant ID: {activeCart.restaurantId.substring(0, 8)}...
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="space-y-4 mb-8">
                  {activeCart.items.map((item) => (
                    <Card key={item.itemId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.itemName}
                                fill
                                className="object-cover"
                                unoptimized={!item.image.startsWith("/")}
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.itemName}</h3>
                            <p className="text-sm text-muted-foreground">Size: {item.potionSize}</p>
                            <p className="text-sm">
                              {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateItemQuantity(activeCart.id, item.itemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateItemQuantity(activeCart.id, item.itemId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItem(activeCart.id, item.itemId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(activeCart.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee (5%)</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                    <Button className="w-full" size="lg" onClick={() => handleCheckout(activeCart.restaurantId)}>
                      Proceed to Checkout
                    </Button>
                    <div className="flex justify-between w-full gap-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleContinueShopping(activeCart.restaurantId)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        onClick={() => clearCart(activeCart.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Cart
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Selected cart is empty</h2>
                <p className="text-muted-foreground mb-6">This cart doesn't have any items.</p>
                <Button onClick={() => router.push("/restaurants")}>Browse Restaurants</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

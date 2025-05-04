"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { MapPin, CreditCard, Loader2, ChevronRight, Check, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Layout components
import { CustomerSidebar } from "@/components/customer/customer-sidebar"
import { CustomerTopNavbar } from "@/components/customer/customer-top-navbar"
import { CustomerMobileNavbar } from "@/components/customer/customer-mobile-navbar"
import { useMobile } from "@/hooks/useMobile"

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

export default function CheckoutPage({ params }: { params: { customerId: string; restaurantId: string } }) {
  const { customerId, restaurantId } = params
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerContact: "",
    longitude: -73.9857, // Default to NYC coordinates
    latitude: 40.7484,
  })
  const [paymentType, setPaymentType] = useState<string>("CASH_ON_DELIVERY")
  const [step, setStep] = useState(1)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    fetchCart()
  }, [customerId, restaurantId])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get<Cart>(`/api/cart/${customerId}/${restaurantId}`)
      setCart(response.data)
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast({
        title: "Error",
        description: "Failed to load cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerInfo((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        toast({
          title: "Success",
          description: "Location detected successfully",
        })
      },
      () => {
        toast({
          title: "Error",
          description: "Unable to retrieve your location",
          variant: "destructive",
        })
      },
    )
  }

  const handleSubmitCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerInfo.customerName || !customerInfo.customerContact) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setStep(2)
  }

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    placeOrder()
  }

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      // Prepare order request
      const orderRequest = {
        customerId,
        restaurantId,
        customerName: customerInfo.customerName,
        customerContact: customerInfo.customerContact,
        longitude: customerInfo.longitude,
        latitude: customerInfo.latitude,
        paymentType,
      }
      // Call order API
      const response = await axios.post<{ orderId: string }>(`/api/order/create`, orderRequest)
      
      // Clear cart on server after successful order creation
      if (response.data) {
        // Clear cart on server
        await axios.delete(`/api/cart/clear/${customerId}/${restaurantId}`)
        // Clear cart in local state
        setCart(null)
        // Navigate to order success page
        router.push(`/order/success/${response.data.orderId}`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    if (step === 2) {
      setStep(1)
    } else {
      router.push(`/cart/${customerId}/${restaurantId}`)
    }
  }

  // Calculate delivery fee and tax
  const deliveryFee = cart?.totalPrice ? cart.totalPrice * 0.05 : 0
  const tax = cart?.totalPrice ? cart.totalPrice * 0.08 : 0
  const totalAmount = cart?.totalPrice ? cart.totalPrice + deliveryFee + tax : 0

  // Layout wrapper starts here
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile when closed */}
      <CustomerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      />

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <CustomerTopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Checkout Content */}
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">Checkout</h1>

            {/* Checkout steps */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex justify-center">
                <div className="flex items-center">
                  <div
                    className={`rounded-full ${
                      step >= 1 ? "bg-green-600" : "bg-gray-300"
                    } h-8 w-8 flex items-center justify-center text-white`}
                  >
                    {step > 1 ? <Check size={16} /> : 1}
                  </div>
                  <div className="text-sm font-medium ml-2">Customer Info</div>
                </div>
                <div className="mx-2 border-t w-16 border-gray-300 self-center"></div>
                <div className="flex items-center">
                  <div
                    className={`rounded-full ${
                      step >= 2 ? "bg-green-600" : "bg-gray-300"
                    } h-8 w-8 flex items-center justify-center text-white`}
                  >
                    {step > 2 ? <Check size={16} /> : 2}
                  </div>
                  <div className="text-sm font-medium ml-2">Payment</div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="max-w-3xl mx-auto text-center py-12">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Add some items to your cart to proceed with checkout</p>
                <Button onClick={() => router.push(`/customer/restaurant/${restaurantId}`)}>Browse Menu</Button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left column: Form */}
                  <div className="md:col-span-2">
                    <Card>
                      {step === 1 && (
                        <>
                          <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleSubmitCustomerInfo} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="customerName">Full Name</Label>
                                <Input
                                  id="customerName"
                                  name="customerName"
                                  value={customerInfo.customerName}
                                  onChange={handleInputChange}
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerContact">Phone Number</Label>
                                <Input
                                  id="customerContact"
                                  name="customerContact"
                                  value={customerInfo.customerContact}
                                  onChange={handleInputChange}
                                  placeholder="Enter your phone number"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Delivery Location</Label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    onClick={getLocation}
                                    variant="secondary"
                                    className="flex items-center"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Detect My Location
                                  </Button>
                                  <div className="text-sm text-muted-foreground">
                                    {customerInfo.latitude !== 40.7484 ? "Location detected" : "Default location"}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 flex justify-between">
                                <Button type="button" variant="outline" onClick={goBack}>
                                  Back to Cart
                                </Button>
                                <Button type="submit">
                                  Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleSubmitPayment} className="space-y-4">
                              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="space-y-3">
                                <div className="flex items-center space-x-2 border rounded-md p-3">
                                  <RadioGroupItem value="CASH_ON_DELIVERY" id="cash" />
                                  <Label htmlFor="cash" className="flex-1 flex items-center cursor-pointer">
                                    Online Payment
                                  </Label>
                                </div>
                              </RadioGroup>

                              <div className="pt-4 flex justify-between">
                                <Button type="button" variant="outline" onClick={goBack}>
                                  Back
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>Place Order</>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </>
                      )}
                    </Card>
                  </div>

                  {/* Right column: Order summary */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {cart.items.map((item) => (
                          <div key={item.itemId} className="flex justify-between text-sm">
                            <span>
                              {item.itemName} x {item.quantity}
                            </span>
                            <span>${item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${cart.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee (5%)</span>
                            <span>${deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold mt-2 text-base">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile bottom navigation */}
        {isMobile && <CustomerMobileNavbar />}
      </div>
    </div>
  )
}

// Helper function to conditionally join class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

"use client"
import { useState, useEffect } from "react"
import { DeliveryCard } from "@/components/ui/delivery-card"
import { DeliveryTimeline } from "@/components/ui/delivery-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeliveryStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryMap } from "@/components/ui/delivery-map"

// Mapping function for status enum
const mapOrderStatus = (status: string): DeliveryStatus => {
  switch (status) {
    case 'Pending':
      return 'PENDING'
    case 'Out for Delivery':
      return 'IN_PROGRESS'
    case 'REJECTED':
      return 'CANCELLED'
    case 'Delivered':
      return 'DELIVERED'
    default:
      return 'PENDING'
  }
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/order/customer/customer123")
        if (!response.ok) throw new Error("Failed to fetch orders")

        const data = await response.json()

        const mappedOrders = data.map((order: any) => ({
          id: order.orderId,
          status: mapOrderStatus(order.orderStatus),
          orderId: order.orderId,
          restaurant: {
            name: "Goalden Meal", // You can use a placeholder until you integrate with restaurant service
            address: "No.2, colombo 2",
            phone: "077465333",
            location: { lat: 0, lng: 0 },
          },
          customer: {
            name: order.customerDetails.name,
            address: "colombo 7",
            phone: order.customerDetails.contact,
            location: {
              lat: order.customerDetails.latitude,
              lng: order.customerDetails.longitude,
            },
          },
          driver: order.driverDetails
            ? {
                name: order.driverDetails.driverName,
                phone: "0774432511",
                vehicle: order.driverDetails.vehicleNumber,
              }
            : undefined,
          driverLocation: order.driverDetails
            ? {
                lat: 40.72,
                lng: -74.0,
              }
            : undefined,
          estimatedTime: "15 min", // Placeholder
          distance: "2.3 mi", // Placeholder
          amount: order.totalAmount.toFixed(2),
          items: order.cartItems.map((item: any) => ({
            name: item.itemName,
            quantity: item.quantity,
          })),
          createdAt: order.createdAt,
          timestamps: {
            createdAt: order.createdAt,
            acceptedAt: order.updatedAt,
            pickedUpAt: order.updatedAt,
            deliveredAt: order.orderStatus === "Delivered" ? order.updatedAt : undefined,
          },
        }))

        setOrders(mappedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleViewDetails = (id: string) => {
    setActiveOrder(id)
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeOrderData = orders.find((order) => order.id === activeOrder)

  const handleRateDelivery = () => {
    setShowRating(true)
  }

  const submitRating = () => {
    setShowRating(false)
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or restaurant..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeOrder && activeOrderData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {activeOrderData.status === "DELIVERED" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Order Delivered</CardTitle>
                  <CardDescription>Your order has been successfully delivered.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeliveryTimeline status={activeOrderData.status} timestamps={activeOrderData.timestamps} />
                </CardContent>
                <CardFooter>
                  {!showRating ? (
                    <Button onClick={handleRateDelivery} className="w-full">
                      Rate Delivery
                    </Button>
                  ) : (
                    <div className="space-y-4 w-full">
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                            <Star
                              className={`h-8 w-8 ${
                                rating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <Button onClick={submitRating} className="w-full" disabled={rating === 0}>
                        Submit Rating
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <>
                <DeliveryMap
                  driverLocation={{
                    lat: activeOrderData.driverLocation?.lat || 0,
                    lng: activeOrderData.driverLocation?.lng || 0,
                    label: activeOrderData.driver?.name || "Driver",
                    icon: "driver",
                  }}
                  pickupLocation={{
                    lat: activeOrderData.restaurant.location.lat,
                    lng: activeOrderData.restaurant.location.lng,
                    label: activeOrderData.restaurant.name,
                    icon: "restaurant",
                  }}
                  dropoffLocation={{
                    lat: activeOrderData.customer.location.lat,
                    lng: activeOrderData.customer.location.lng,
                    label: "Your Location",
                    icon: "customer",
                  }}
                  className="h-[400px]"
                />
                <DeliveryTimeline status={activeOrderData.status} timestamps={activeOrderData.timestamps} />
              </>
            )}

            <Button variant="outline" className="w-full" onClick={() => setActiveOrder(null)}>
              Back to Orders
            </Button>
          </div>

          <div>
            <DeliveryCard
              id={activeOrderData.id}
              status={activeOrderData.status}
              orderId={activeOrderData.orderId}
              restaurant={activeOrderData.restaurant}
              customer={activeOrderData.customer}
              driver={activeOrderData.driver}
              estimatedTime={activeOrderData.estimatedTime}
              distance={activeOrderData.distance}
              amount={activeOrderData.amount}
              createdAt={activeOrderData.createdAt}
              viewType="customer"
              className="mb-4"
            />

            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="font-medium">Order Summary</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {activeOrderData.items.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${(Number.parseFloat(activeOrderData.amount) - 5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${(Number.parseFloat(activeOrderData.amount) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${activeOrderData.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {filteredOrders.filter((d) => ["PENDING", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">No active orders</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrders
                  .filter((d) => ["PENDING", "IN_PROGRESS"].includes(d.status))
                  .map((order) => (
                    <DeliveryCard
                      key={order.id}
                      id={order.id}
                      status={order.status}
                      orderId={order.orderId}
                      restaurant={order.restaurant}
                      customer={order.customer}
                      driver={order.driver}
                      estimatedTime={order.estimatedTime}
                      distance={order.distance}
                      amount={order.amount}
                      createdAt={order.createdAt}
                      viewType="customer"
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {filteredOrders.filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status)).length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">No completed orders</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrders
                  .filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status))
                  .map((order) => (
                    <DeliveryCard
                      key={order.id}
                      id={order.id}
                      status={order.status}
                      orderId={order.orderId}
                      restaurant={order.restaurant}
                      customer={order.customer}
                      driver={order.driver}
                      estimatedTime={order.estimatedTime}
                      distance={order.distance}
                      amount={order.amount}
                      createdAt={order.createdAt}
                      viewType="customer"
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <DeliveryCard
                    key={order.id}
                    id={order.id}
                    status={order.status}
                    orderId={order.orderId}
                    restaurant={order.restaurant}
                    customer={order.customer}
                    driver={order.driver}
                    estimatedTime={order.estimatedTime}
                    distance={order.distance}
                    amount={order.amount}
                    createdAt={order.createdAt}
                    viewType="customer"
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
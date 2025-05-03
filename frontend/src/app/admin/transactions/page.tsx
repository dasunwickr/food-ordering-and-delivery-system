"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrdersAnalyticsPage() {
  const [totalOrderPayments, setTotalOrderPayments] = useState<number | null>(null)
  const [searchOrderId, setSearchOrderId] = useState("")
  const [orderTotal, setOrderTotal] = useState<number | null>(null)
  const [userRestaurantPayments, setUserRestaurantPayments] = useState<any[]>([])

  // Fetch total order payments
  const fetchTotalOrderPayments = async () => {
    try {
      const response = await fetch("http://localhost:4242/total-order-payments")
      const data = await response.json()
      setTotalOrderPayments(data.total)
    } catch (error) {
      console.error("Error fetching total order payments:", error)
    }
  }

  // Fetch order total by ID
  const fetchOrderTotalById = async () => {
    if (!searchOrderId) return
    try {
      const response = await fetch(`http://localhost:4242/order-total/${searchOrderId}`)
      const data = await response.json()
      setOrderTotal(data.total)
    } catch (error) {
      console.error("Error fetching order total by ID:", error)
    }
  }

  // Fetch user-restaurant payments
const fetchUserRestaurantPayments = async () => {
    try {
      const response = await fetch("http://localhost:4242/user-restaurant-payments");
      const data = await response.json();
      setUserRestaurantPayments(data.payments); // Ensure payments array is set correctly
    } catch (error) {
      console.error("Error fetching user-restaurant payments:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Orders Analytics</h1>

      {/* Total Orders Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Total from All Orders</CardTitle>
          <CardDescription>Displays the total payment from all orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchTotalOrderPayments}>Fetch Total</Button>
            {totalOrderPayments !== null && (
              <p className="text-lg font-semibold">Total: ${totalOrderPayments.toFixed(2)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Order Total by ID */}
      <Card>
        <CardHeader>
          <CardTitle>Search Order Total by ID</CardTitle>
          <CardDescription>Enter an order ID to fetch its total amount.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Enter Order ID"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
            />
            <Button onClick={fetchOrderTotalById}>Search</Button>
          </div>
          {orderTotal !== null && (
            <p className="mt-4 text-lg font-semibold">Order Total: ${orderTotal.toFixed(2)}</p>
          )}
        </CardContent>
      </Card>

      {/* User-Restaurant Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>User-Restaurant Payments</CardTitle>
          <CardDescription>Displays all user-restaurant payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={fetchUserRestaurantPayments}>Refresh Payments</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Restaurant ID</TableHead>
                <TableHead>Payment Amount ($)</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRestaurantPayments.length > 0 ? (
                userRestaurantPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.userId}</TableCell>
                    <TableCell>{payment.restaurantId}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No payments available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DeliveryReportsPage() {
  const [totalDeliveryFees, setTotalDeliveryFees] = useState<number | null>(null);
  const [searchDriverId, setSearchDriverId] = useState("");
  const [driverTotal, setDriverTotal] = useState<number | null>(null);
  const [driverPayments, setDriverPayments] = useState<any[]>([]);

  // Fetch total delivery fees
  const fetchTotalDeliveryFees = async () => {
    try {
      const response = await fetch("http://localhost:4242/total-delivery-fee");
      const data = await response.json();
      setTotalDeliveryFees(data.total);
    } catch (error) {
      console.error("Error fetching total delivery fees:", error);
    }
  };

  // Fetch total delivery fee by driver ID
  const fetchDriverTotalById = async () => {
    if (!searchDriverId) return;
    try {
      const response = await fetch(`http://localhost:4242/driver-total/${searchDriverId}`);
      const data = await response.json();
      setDriverTotal(data.total);
    } catch (error) {
      console.error("Error fetching driver total by ID:", error);
    }
  };

  // Fetch driver payments
  const fetchDriverPayments = async () => {
    try {
      const response = await fetch("http://localhost:4242/driver-payments");
      const data = await response.json();
      setDriverPayments(data.payments);
    } catch (error) {
      console.error("Error fetching driver payments:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Delivery Reports</h1>

      {/* Total Delivery Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Total Delivery Fees</CardTitle>
          <CardDescription>Displays the total delivery fees paid through the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchTotalDeliveryFees}>Fetch Total</Button>
            {totalDeliveryFees !== null && (
              <p className="text-lg font-semibold">Total: ${totalDeliveryFees.toFixed(2)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Driver Total by ID */}
      <Card>
        <CardHeader>
          <CardTitle>Search Driver Total by ID</CardTitle>
          <CardDescription>Enter a driver ID to fetch their total delivery fee.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Enter Driver ID"
              value={searchDriverId}
              onChange={(e) => setSearchDriverId(e.target.value)}
            />
            <Button onClick={fetchDriverTotalById}>Search</Button>
          </div>
          {driverTotal !== null && (
            <p className="mt-4 text-lg font-semibold">Driver Total: ${driverTotal.toFixed(2)}</p>
          )}
        </CardContent>
      </Card>

      {/* Driver Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Payments</CardTitle>
          <CardDescription>Displays all driver payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={fetchDriverPayments}>Refresh Payments</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver ID</TableHead>
                <TableHead>Delivery Fee ($)</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverPayments.length > 0 ? (
                driverPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.driverId}</TableCell>
                    <TableCell>${payment.deliveryFee.toFixed(2)}</TableCell>
                    <TableCell>{payment.paymentType}</TableCell>
                    <TableCell>{payment.date}</TableCell>
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
  );
}
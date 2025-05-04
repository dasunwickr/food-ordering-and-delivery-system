"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    amount: "",
    customerId: "",
    orderId: "",
    restaurantId: "",
    deliveryFee: "",
    driverId: "",
  });

  const [consentGiven, setConsentGiven] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill form with query parameters using useSearchParams
  useEffect(() => {
    const orderId = searchParams.get("orderId") ?? "";
    const customerId = searchParams.get("customerId") ?? "";
    const restaurantId = searchParams.get("restaurantId") ?? "";
    const amount = searchParams.get("amount") ?? "";
    const deliveryFee = searchParams.get("deliveryFee") ?? "";
    const driverId = searchParams.get("driverId") ?? "";

    setFormData({
      orderId,
      customerId,
      restaurantId,
      amount,
      deliveryFee,
      driverId,
    });
  }, [searchParams]); // Trigger on URL param changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!consentGiven) {
      alert("Please agree to the terms before proceeding");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4242/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
          deliveryFee: Number.parseFloat(formData.deliveryFee),
          paymentType: "card",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/payment/disclaimer?orderId=${formData.orderId}`);
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                type="text"
                name="customerId"
                placeholder="Customer ID"
                value={formData.customerId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="text"
                name="orderId"
                placeholder="Order ID"
                value={formData.orderId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantId">Restaurant ID</Label>
              <Input
                id="restaurantId"
                type="text"
                name="restaurantId"
                placeholder="Restaurant ID"
                value={formData.restaurantId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee</Label>
              <Input
                id="deliveryFee"
                type="text"
                name="deliveryFee"
                placeholder="Delivery Fee"
                value={formData.deliveryFee}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID</Label>
              <Input
                id="driverId"
                type="text"
                name="driverId"
                placeholder="Driver ID"
                value={formData.driverId}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm text-gray-600">
                I agree that my transaction details will be used for app and system improvement
              </Label>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={!consentGiven}>
              Proceed to Checkout
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500">
          Your payment information is securely processed
        </CardFooter>
      </Card>
    </div>
  );
}
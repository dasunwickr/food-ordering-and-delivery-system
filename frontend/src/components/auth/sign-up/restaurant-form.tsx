"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapSelector } from "@/components/ui/map-selector";
import { useSignUpStore } from "@/store/auth-store";

export function RestaurantSignUp() {
  const { 
    restaurantName, restaurantLicenseNumber, restaurantType, restaurantLocation, errors,
    setField, validateRestaurantStep
  } = useSignUpStore();

  const handleSubmit = async () => {
    if (validateRestaurantStep()) {
      try {
        // Here you would submit the form data to your API
        console.log('Restaurant form submitted successfully');
        // Redirect or show success message
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Restaurant Details</CardTitle>
        <CardDescription>Please provide your restaurant information</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name</Label>
          <Input
            id="restaurantName"
            value={restaurantName}
            onChange={(e) => setField("restaurantName", e.target.value)}
            placeholder="Enter restaurant name"
            className={errors.restaurantName ? "border-red-500" : ""}
          />
          {errors.restaurantName && (
            <p className="text-sm text-red-500">{errors.restaurantName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantLicenseNumber">License Number</Label>
          <Input
            id="restaurantLicenseNumber"
            value={restaurantLicenseNumber}
            onChange={(e) => setField("restaurantLicenseNumber", e.target.value)}
            placeholder="Enter license number"
            className={errors.restaurantLicenseNumber ? "border-red-500" : ""}
          />
          {errors.restaurantLicenseNumber && (
            <p className="text-sm text-red-500">{errors.restaurantLicenseNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantType">Restaurant Type</Label>
          <Input
            id="restaurantType"
            value={restaurantType}
            onChange={(e) => setField("restaurantType", e.target.value)}
            placeholder="Ex: Fine Dining, Fast Food, etc."
            className={errors.restaurantType ? "border-red-500" : ""}
          />
          {errors.restaurantType && (
            <p className="text-sm text-red-500">{errors.restaurantType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Restaurant Location</Label>
          <MapSelector 
            location={restaurantLocation}
            onLocationChange={(loc) => setField("restaurantLocation", loc)}
            height="350px"
          />
          {errors.restaurantLocation && (
            <p className="text-sm text-red-500">{errors.restaurantLocation}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit}>
          Complete Registration
        </Button>
      </CardFooter>
    </Card>
  );
}
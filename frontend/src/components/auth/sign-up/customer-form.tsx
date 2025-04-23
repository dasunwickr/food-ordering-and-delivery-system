"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapSelector } from "@/components/ui/map-selector";
import { useSignUpStore } from "@/store/auth-store";

export function CustomerSignUp() {
  const { 
    location, errors,
    setField, validateCustomerStep
  } = useSignUpStore();

  const handleSubmit = async () => {
    if (validateCustomerStep()) {
      try {
        // Here you would submit the form data to your API
        console.log('Form submitted successfully');
        // Redirect or show success message
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Where would you like your food delivered?</CardTitle>
        <CardDescription>
          Please select your delivery location on the map
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Delivery Location</Label>
          <MapSelector 
            location={location}
            onLocationChange={(loc) => setField("location", loc)}
            height="350px"
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
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
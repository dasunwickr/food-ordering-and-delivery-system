
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSignUpStore } from "@/store/auth-store";

export function DriverSignUp() {
  const { 
    vehicleType, vehiclePlateNumber, licenseNumber, errors,
    setField, validateDriverStep
  } = useSignUpStore();

  const handleSubmit = async () => {
    if (validateDriverStep()) {
      try {
        // Here you would submit the form data to your API
        console.log('Driver form submitted successfully');
        // Redirect or show success message
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Driver Details</CardTitle>
        <CardDescription>Please provide your vehicle information</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select 
            value={vehicleType}
            onValueChange={(value) => setField("vehicleType", value)}
          >
            <SelectTrigger className={errors.vehicleType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="motorbike">Motorbike</SelectItem>
              <SelectItem value="scooter">Scooter</SelectItem>
              <SelectItem value="bicycle">Bicycle</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicleType && (
            <p className="text-sm text-red-500">{errors.vehicleType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
          <Input
            id="vehiclePlateNumber"
            value={vehiclePlateNumber}
            onChange={(e) => setField("vehiclePlateNumber", e.target.value)}
            placeholder="Enter vehicle plate number"
            className={errors.vehiclePlateNumber ? "border-red-500" : ""}
          />
          {errors.vehiclePlateNumber && (
            <p className="text-sm text-red-500">{errors.vehiclePlateNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">Driver's License Number</Label>
          <Input
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => setField("licenseNumber", e.target.value)}
            placeholder="Enter license number"
            className={errors.licenseNumber ? "border-red-500" : ""}
          />
          {errors.licenseNumber && (
            <p className="text-sm text-red-500">{errors.licenseNumber}</p>
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
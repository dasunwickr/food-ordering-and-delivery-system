"use client";
import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for form validation using Zod
const addMenuSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  availabilityStatus: z.boolean(),
  offer: z.number().min(0, "Offer must be non-negative"),
  image: z.instanceof(File).optional(), // Add image as an optional File type
  portions: z.array(
    z.object({
      portionSize: z.string().min(1, "Portion size is required"),
      price: z.number().min(0, "Price must be non-negative"),
    })
  ),
});

// Infer the type from the schema
type AddMenuFormValues = z.infer<typeof addMenuSchema>;

const AddMenuForm = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [portionFields, setPortionFields] = useState<
    { portionSize: string; price: number }[]
  >([{ portionSize: "", price: 0 }]);

  // Initialize form with react-hook-form and Zod validation
  const formMethods = useForm<AddMenuFormValues>({
    resolver: zodResolver(addMenuSchema),
    defaultValues: {
      restaurantId: "",
      itemName: "",
      description: "",
      category: "",
      availabilityStatus: true,
      offer: 0,
      image: undefined,
      portions: [{ portionSize: "", price: 0 }],
    },
  });

  // Handle form submission
  const onSubmit = async (values: AddMenuFormValues) => {
    const formDataToSend = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else if (typeof value === "boolean") {
        formDataToSend.append(key, value.toString());
      } else if (key === "portions") {
        // Convert portions array to JSON string
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value.toString());
      }
    });

    try {
      const response = await fetch("http://localhost:8083/menu/add", {
        method: "POST",
        body: formDataToSend,
      });
      if (response.ok) {
        alert("Menu item added successfully!");
        formMethods.reset();
        setPreview(null);
        setPortionFields([{ portionSize: "", price: 0 }]);
      } else {
        alert("Failed to add menu item.");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("An error occurred while adding the menu item.");
    }
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      formMethods.setValue("image", files[0]); // Update form state with the selected file
      setPreview(URL.createObjectURL(files[0])); // Update preview
    }
  };

  // Add a new portion field
  const addPortionField = () => {
    setPortionFields([...portionFields, { portionSize: "", price: 0 }]);
  };

  // Remove a portion field
  const removePortionField = (index: number) => {
    const updatedFields = portionFields.filter((_, i) => i !== index);
    setPortionFields(updatedFields);
    formMethods.setValue(
      "portions",
      updatedFields.map((field) => ({
        portionSize: field.portionSize,
        price: field.price,
      }))
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">
        Add Menu Item
      </h1>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Restaurant ID */}
          <FormField
            control={formMethods.control}
            name="restaurantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restaurant ID</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Item Name */}
          <FormField
            control={formMethods.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={formMethods.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={formMethods.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Availability Status */}
          <FormField
            control={formMethods.control}
            name="availabilityStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="w-4 h-4 text-primary"
                  />
                </FormControl>
                <FormLabel>Available on menu</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Offer */}
          <FormField
            control={formMethods.control}
            name="offer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <FormField
            control={formMethods.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div>
                    <label
                      htmlFor="image-upload"
                      className="block cursor-pointer text-primary hover:underline"
                    >
                      Choose Image
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleFileChange(e);
                        field.onChange(e.target.files?.[0]);
                      }}
                      className="hidden"
                    />
                  </div>
                </FormControl>
                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Food preview"
                      className="object-cover w-full h-32 rounded-lg"
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Portions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Portions</h3>
            {portionFields.map((portion, index) => (
              <div key={index} className="flex items-end space-x-2">
                <FormField
                  control={formMethods.control}
                  name={`portions.${index}.portionSize`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Portion Size</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name={`portions.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={() => removePortionField(index)}
                  className="button-destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addPortionField}
              className="w-full button-accent"
            >
              Add Portion
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full button-primary"
          >
            Add to Menu
          </Button>
        </form>
      </FormProvider>
      <div className="text-center mt-6 text-muted-foreground text-sm">
        Restaurant Menu Management System &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default AddMenuForm;
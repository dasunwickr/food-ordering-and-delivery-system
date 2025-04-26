"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
// Define the schema for form validation using Zod
const addMenuSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  availabilityStatus: z.boolean(),
  offer: z.number().min(0, "Offer must be non-negative"),
  image: z.instanceof(File).optional(),
  portions: z.array(
    z.object({
      portionSize: z.string().min(1, "Portion size is required"),
      price: z.number().min(0, "Price must be non-negative"),
    })
  ),
});

// Infer the type from the schema
type AddMenuFormValues = z.infer<typeof addMenuSchema>;

// Define the Category interface
interface Category {
  id: number;
  name: string;
}

const AddMenuForm = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>("http://localhost:8083/categories");
        if (response.status === 200) {
          setCategories(response.data); // Set the fetched categories
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      formMethods.setValue("image", files[0]); // Update form state with the selected file
      setPreview(URL.createObjectURL(files[0])); // Update preview
    }
  };

  // Handle form submission
  const onSubmit = async (values: AddMenuFormValues) => {
    const formDataToSend = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        console.warn(`Skipping field '${key}' because it is undefined or null.`);
        return; // Skip undefined or null values
      }

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
      const API_URL = "http://localhost:8083";
      const response = await fetch(`${API_URL}/menu/add`, {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Menu item added successfully!");
        router.push("/restaurant/menu");
      } else {
        alert("Failed to add menu item.");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("An error occurred while adding the menu item.");
    }
  };

  // Add a portion field
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
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    className="h-4 w-4 text-primary"
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
                <FormLabel>Offer (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter offer percentage"
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
            render={() => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <>
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
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
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
          <div>
            <h3 className="text-lg font-semibold mb-2">Portions</h3>
            {portionFields.map((portion, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <FormField
                  control={formMethods.control}
                  name={`portions.${index}.portionSize`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Portion Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Small" {...field} />
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
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 9.99"
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
          <Button type="submit" className="w-full button-primary">
            Add Menu Item
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddMenuForm;
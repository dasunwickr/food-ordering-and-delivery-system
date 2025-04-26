"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// Define the type for a category
interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

const DisplayCategoriesFood = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8083/categories");
        if (response.status === 200) {
          setCategories(response.data); // Assuming the backend returns an array of categories
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-amber-700 mb-6">
        Available Categories
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${encodeURIComponent(category.name)}`}
            className="block"
          >
            <div className="bg-gray-100 p-4 rounded-lg shadow-md text-center transition-transform hover:scale-105 cursor-pointer">
              <img
                src={category.imageUrl}
                alt={`Category: ${category.name}`}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              <h2 className="text-lg font-semibold text-gray-800">
                {category.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DisplayCategoriesFood;
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Define the type for a restaurant
interface Restaurant {
  id: string;
  restaurantName: string; // Matches the backend field
  profilePictureUrl?: string | null; // Matches the backend field
}

const RestaurantsSlider = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default image URL (fallback if no profile picture)
  const defaultImageUrl =
    "http://res.cloudinary.com/dwi1xi0qp/image/upload/v1745685680/ji3cwtwu7ehlh4b6k5gk.jpg";

  // Ref for the container element
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch all restaurants from the backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get<Restaurant[]>(
          "http://localhost/api/user-service/users/type/RESTAURANT"
        );
        if (response.status === 200) {
          setRestaurants(response.data);
          console.log(response.data);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Handle scrolling to the left
  const handleScrollLeft = () => {
    if (containerRef.current) {
      const newScrollPosition = Math.max(
        0,
        containerRef.current.scrollLeft - containerRef.current.offsetWidth
      );
      containerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle scrolling to the right
  const handleScrollRight = () => {
    if (containerRef.current) {
      const newScrollPosition =
        containerRef.current.scrollLeft + containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white overflow-hidden">
      {/* Horizontal Slider Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={handleScrollLeft}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/80 transition duration-300 z-10"
        >
          <ChevronLeftIcon size={24} />
        </button>
        <button
          onClick={handleScrollRight}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/80 transition duration-300 z-10"
        >
          <ChevronRightIcon size={24} />
        </button>

        {/* Restaurant Cards */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-hidden ml-10"
        >
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/customer/restaurant/${restaurant.id}`}
              className="group min-w-[200px] flex-shrink-0 bg-gray-100 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer"
            >
              {/* Use profilePictureUrl instead of imageUrl */}
              <img
                src={restaurant.profilePictureUrl || defaultImageUrl}
                alt={`Restaurant: ${restaurant.restaurantName}`}
                className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
              />
              {/* Name Section */}
              <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {restaurant.restaurantName}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantsSlider;
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Define the type for a menu item
interface MenuItem {
  id: number;
  restaurantId: number;
  itemName: string;
  description: string;
  category: string;
  availabilityStatus: boolean;
  offer: number; // Offer percentage (e.g., 10 for 10% off)
  imageUrl?: string;
  imagePublicId?: string;
  portions: {
    id: number;
    portionSize: string;
    price: number;
  }[];
}

const MenuItemsWithOffers = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Fetch all menu items with offers from the backend
  useEffect(() => {
    const fetchMenuItemsWithOffers = async () => {
      try {
        const response = await axios.get<MenuItem[]>(
          "http://localhost/api/menu-service/menu/all"
        );
        if (response.status === 200) {
          // Filter menu items to include only those with a non-zero offer
          const filteredItems = response.data.filter((item) => item.offer > 0);
          setMenuItems(filteredItems);
        }
      } catch (err) {
        console.error("Error fetching menu items with offers:", err);
        setError("Failed to load menu items with offers.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItemsWithOffers();
  }, []);

  // Auto-play functionality with fade animation
  useEffect(() => {
    if (menuItems.length === 0) return;

    const intervalId = setInterval(() => {
      // Start fade out
      setFadeIn(false);

      // Change index after fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
        // Start fade in
        setFadeIn(true);
      }, 300);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [menuItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[var(--color-destructive)] p-4 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
        No menu items with offers available at this time.
      </div>
    );
  }

  // Handle manual navigation with animation
  const handleNext = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
      setFadeIn(true);
    }, 300);
  };

  const handlePrev = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex === 0 ? menuItems.length - 1 : prevIndex - 1)
      );
      setFadeIn(true);
    }, 300);
  };

  // Get the current menu item
  const currentItem = menuItems[currentIndex];

  // Calculate discounted price
  const getDiscountedPrice = (price: number) => {
    return (price - (price * currentItem.offer / 100)).toFixed(2);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Progress bar */}
      <div className="w-full bg-[var(--color-muted)] h-1 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-[var(--color-primary)] h-1 transition-all duration-300 ease-out"
          style={{
            width: `${((currentIndex + 1) / menuItems.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Slider Container */}
      <div className="relative w-full overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[var(--color-primary)] text-white p-2 rounded-full shadow-lg hover:bg-[var(--color-sidebar-primary)] transition-all duration-300 z-10 opacity-80 hover:opacity-100"
          aria-label="Previous item"
        >
          <ChevronLeftIcon size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[var(--color-primary)] text-white p-2 rounded-full shadow-lg hover:bg-[var(--color-sidebar-primary)] transition-all duration-300 z-10 opacity-80 hover:opacity-100"
          aria-label="Next item"
        >
          <ChevronRightIcon size={24} />
        </button>

        {/* Menu Item Card with fade effect */}
        <div className="flex justify-center w-full">
          <div
            key={currentItem.id}
            className={`w-full transition-all duration-300 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/2 relative">
                {currentItem.imageUrl ? (
                  <img
                    src={currentItem.imageUrl}
                    alt={`${currentItem.itemName}`}
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-[var(--color-muted)] flex items-center justify-center">
                    <span className="text-[var(--color-muted-foreground)]">
                      No image available
                    </span>
                  </div>
                )}
                {/* Offer Badge */}
                <div
                  className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-lg font-bold px-6 py-2 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300"
                  style={{ zIndex: 10 }}
                >
                  {currentItem.offer}% OFF
                </div>
              </div>

              {/* Details Section */}
              <div className="md:w-1/2 p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                    {currentItem.itemName}
                  </h2>
                  <p className="text-sm font-medium uppercase tracking-wider">
                    {currentItem.category}
                  </p>
                </div>

                <p className="text-[var(--color-muted-foreground)] italic border-l-4 border-[var(--color-border)] pl-4">
                  {currentItem.description}
                </p>

                {/* Portions and pricing */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-[var(--color-muted-foreground)]">
                    Available Portions:
                  </h3>
                  <div className="space-y-2">
                    {currentItem.portions &&
                      currentItem.portions.map((portion) => (
                        <div
                          key={portion.id}
                          className="flex justify-between items-center bg-[var(--color-card)] p-3 rounded-lg shadow-sm"
                        >
                          <span className="font-medium">{portion.portionSize}</span>
                          <div className="text-right">
                            <span className="text-gray-400 line-through mr-2">
                              ${portion.price.toFixed(2)}
                            </span>
                            <span className="text-[var(--color-primary)] font-bold">
                              ${getDiscountedPrice(portion.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Availability Status */}
                <div className="pt-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      currentItem.availabilityStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentItem.availabilityStatus
                      ? "Available Now"
                      : "Currently Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {menuItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setFadeIn(false);
              setTimeout(() => {
                setCurrentIndex(index);
                setFadeIn(true);
              }, 300);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "w-6 bg-[var(--color-primary)]"
                : "w-2 bg-[var(--color-muted)] hover:bg-[var(--color-accent)]"
            }`}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuItemsWithOffers;
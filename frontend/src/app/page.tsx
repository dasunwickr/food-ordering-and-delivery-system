"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Components
import RestaurantsSlider from "@/components/common/restaurants/restaurantSlider";
import DisplayCategories from "@/components/common/categories/categories";
import MenuItemsWithOffers from "@/components/customer/menu-item-offers";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";

// Example auth functions — replace with your real logic
const isAuthenticated = () => {
  // Replace with actual auth check
  return true;
};

const getUserType = () => {
  // Replace with your user type logic
  return "customer";
};

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  // Redirect based on authentication
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     const userType = getUserType();
  //     if (userType) {
  //       switch (userType.toLowerCase()) {
  //         case "admin":
  //           router.push("/admin");
  //           break;
  //         case "customer":
  //           router.push("/customer");
  //           break;
  //         default:
  //           router.push("/");
  //       }
  //     }
  //   }

  //   const handleScroll = () => {
  //     setIsSticky(window.scrollY > 100);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [router]);

  return (
    <main className="bg-white px-4 sm:px-6 lg:px-8 py-6">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20 overflow-hidden rounded-lg mb-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
          {/* Text Content */}
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Discover Tasty Food Around You
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Order food online from local restaurants and get it delivered fast.
            </p>

            {/* Location Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-3/4"
              />
              <button
                onClick={() => {
                  if (address.trim()) {
                    alert("Searching for restaurants near: " + address);
                  } else {
                    alert("Please enter an address.");
                  }
                }}
                className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 py-3 rounded-md transition"
              >
                Search
              </button>
            </div>

            <p className="text-sm text-white/70">
              Available in over 100 cities worldwide
            </p>
          </div>

          {/* Mockup Image */}
          <div className="md:w-1/2 flex justify-center">
            <div className="relative h-80 w-60">
              <Image
                src="https://res.cloudinary.com/dwi1xi0qp/image/upload/v1745664463/ddrsyyrnb5vldmfvq8sq.jpg"
                alt="Food Delivery App"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl"></div>
      </section>
      {/* New Offers Section */}
      <section className="py-12 bg-white rounded-lg mb-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Deals & Offers</h2>
            <Link href="/offers" className="flex items-center text-primary hover:underline">
              View All <span className="ml-2">→</span>
            </Link>
          </div>
          <MenuItemsWithOffers /> {/* ← Importing the new offer slider */}
        </div>
      </section>


            {/* Categories Section */}
            <section className="py-12 bg-gray-50 rounded-lg mb-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10">Browse by Category</h2>
          <DisplayCategories />
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="py-12 bg-white rounded-lg mb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Restaurants</h2>
            <Link href="/restaurants" className="flex items-center text-primary hover:underline">
              View All <span className="ml-2">→</span>
            </Link>
          </div>
          <RestaurantsSlider />
        </div>
      </section>

      
      {/* Newsletter Section */}
      <section className="py-12 bg-gray-50 rounded-lg mb-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for exclusive deals, new restaurant alerts, and food inspiration.
          </p>
          <div className="flex flex-col sm:flex-row items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full sm:w-3/4 px-4 py-3 mb-4 sm:mb-0 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="w-full sm:w-1/4 bg-primary text-white font-semibold py-3 rounded-r-md hover:bg-blue-600 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [address, setAddress] = useState("");

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-primary">
            Nom<span className="text-accent">Nom</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#menu" className="text-gray-700 hover:text-primary transition-colors">
            Menu
          </Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#restaurants" className="text-gray-700 hover:text-primary transition-colors">
            Restaurants
          </Link>
          <Link href="#about" className="text-gray-700 hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/sign-in" className="hidden md:block text-primary hover:underline">
            Login
          </Link>
          <Link
            href="/sign-up"
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
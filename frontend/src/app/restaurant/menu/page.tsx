"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import MenuItems, { MenuItem } from "@/components/restaurant/menu-items";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const restaurantId = localStorage.getItem("userId"); // Make sure this is correct key
      if (!restaurantId) {
        console.error("Restaurant ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<MenuItem[]>(
          `http://localhost/api/menu-service/menu/restaurant/${restaurantId}`
        );
        setMenuItems(response.data);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) return <p>Loading menu...</p>;

  return (
    <div>
      <MenuItems menuItems={menuItems} />
    </div>
  );
}
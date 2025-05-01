import axios from "axios";
import MenuItems, { MenuItem } from "@/components/restaurant/menu-items";

// Fetch menu items on the server side using Axios
async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await axios.get<MenuItem[]>(
      "http://localhost/api/menu-service/menu/all"
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    throw new Error("Failed to fetch menu items");
  }
}

export default async function MenuPage() {
  const menuItems = await fetchMenuItems();

  return (
    <div>
      <MenuItems menuItems={menuItems} />
    </div>
  );
}
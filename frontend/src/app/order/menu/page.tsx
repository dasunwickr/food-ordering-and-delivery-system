import { MenuItems } from "@/components/order/menu-items";

// Fetch menu items using native fetch (works in Server Components)
async function fetchMenuItems(restaurantId: number) {
  try {
    const response = await fetch(`http://localhost/api/menu-service/menu/all?restaurantId=${restaurantId}`, {
      cache: "no-store", // optional: prevents caching
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export default async function MenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const restaurantId = Number(params.restaurantId);
  const menuItems = await fetchMenuItems(restaurantId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
      <MenuItems
        menuItems={menuItems}
        customerId="customer123"
        restaurantId={restaurantId}
      />
    </div>
  );
}

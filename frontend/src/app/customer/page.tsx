import React from "react";
import DisplayCategories from "@/components/common/categories/categories"; // Adjust the import path as needed
import RestaurantsSlider from "@/components/common/restaurants/restaurantSlider";
function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold my-4">Available Categories</h1>
      <DisplayCategories />
      <RestaurantsSlider/>
    </div>
  );
}

export default Page;
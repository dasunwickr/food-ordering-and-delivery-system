import React from "react";
import RestaurantsSlider from "@/components/common/restaurants/restaurantSlider";
import DisplayCategories from "@/components/common/categories/categories";
import MenuItemsWithOffers from "@/components/customer/menu-item-offers";

function Page() {
  return (
    <div>
     <MenuItemsWithOffers/>
      <DisplayCategories/>
      <RestaurantsSlider/>
      

    </div>
  );
}

export default Page;
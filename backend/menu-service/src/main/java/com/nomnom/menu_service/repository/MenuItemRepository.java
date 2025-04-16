package com.nomnom.menu_service.repository;

import com.nomnom.menu_service.model.MenuItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItems, Long> {
    List<MenuItems> findByRestaurantId(Long restaurantId);
}

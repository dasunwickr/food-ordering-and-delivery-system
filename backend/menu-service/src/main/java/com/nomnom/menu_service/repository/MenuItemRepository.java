package com.nomnom.menu_service.repository;

import com.nomnom.menu_service.model.MenuItems;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItems, Long> {
}

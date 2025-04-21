package com.nomnom.menu_service.repository;

import com.nomnom.menu_service.model.MenuItemPortion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemPortionRepository extends JpaRepository<MenuItemPortion, Long> {
    List<MenuItemPortion> findByMenuItemId(Long menuItemId);

    void deleteAllByMenuItemId(Long id);
}
package com.nomnom.menu_service.repository;

import com.nomnom.menu_service.model.MenuItems;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface MenuItemServiceInterface {

    MenuItems saveItem(String itemName, Double price, String category, Boolean availabilityStatus,
                       String description, MultipartFile file) throws IOException;

    List<MenuItems> getAllMenuItems();

    byte[] getUserImage(Long id);

    MenuItems getMenuItemById(Long id);

    MenuItems updateMenuItem(Long id, String itemName, Double price, String category,
                             Boolean availabilityStatus, String description, MultipartFile file) throws IOException;

    boolean deleteMenuItem(Long id);
}
package com.nomnom.menu_service.repository;

import com.nomnom.menu_service.model.MenuItemPortion;
import com.nomnom.menu_service.model.MenuItems;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface MenuItemServiceInterface {

    MenuItems saveItem(String itemName,Long restaurantId,Double offer, String category, Boolean availabilityStatus,
                       String description, MultipartFile file,List<MenuItemPortion> portions) throws IOException;

    List<MenuItems> getAllMenuItems();

    byte[] getUserImage(Long id);

    MenuItems getMenuItemById(Long id);

    MenuItems updateMenuItem(Long id, String itemName,Double offer, String category,
                             Boolean availabilityStatus, String description, MultipartFile file,List<MenuItemPortion> portions) throws IOException;

    List<MenuItemPortion> getPortionsForMenuItem(Long menuItemId);

    List<MenuItems> getMenuItemsByRestaurantId(Long restaurantId);




    boolean deleteMenuItem(Long id);


}
package com.nomnom.menu_service.service;

import com.nomnom.menu_service.model.MenuItems;
import com.nomnom.menu_service.repository.MenuItemRepository;
import com.nomnom.menu_service.repository.MenuItemServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService implements MenuItemServiceInterface {

    @Autowired
    private MenuItemRepository ItemRepository;

    @Override
    public MenuItems saveItem(String itemName,Long restaurantId,Double smallPortionPrice,Double mediumPortionPrice,Double largePortionPrice,Double offer, String category, Boolean availabilityStatus,
                              String description, MultipartFile file) throws IOException {
        MenuItems Item = new MenuItems();
        Item.setRestaurantId(restaurantId);
        Item.setItemName(itemName);
        Item.setSmallPortionPrice(smallPortionPrice);
        Item.setMediumPortionPrice(mediumPortionPrice);
        Item.setLargePortionPrice(largePortionPrice);
        Item.setOffer(offer);
        Item.setCategory(category);
        Item.setAvailabilityStatus(availabilityStatus);
        Item.setDescription(description);
        Item.setImage(file.getBytes());  // Convert image to byte[]
        return ItemRepository.save(Item);
    }

    @Override
    public List<MenuItems> getAllMenuItems() {
        return ItemRepository.findAll();
    }

    @Override
    public byte[] getUserImage(Long id) {
        Optional<MenuItems> user = ItemRepository.findById(id);
        return user.map(MenuItems::getImage).orElse(null);
    }

    @Override
    public MenuItems getMenuItemById(Long id) {
        return ItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
    }

    @Override
    public MenuItems updateMenuItem(Long id, String itemName,Double smallPortionPrice,Double mediumPortionPrice,Double largePortionPrice,Double offer, String category,
                                    Boolean availabilityStatus, String description, MultipartFile file) throws IOException {
        Optional<MenuItems> optionalItem = ItemRepository.findById(id);

        if (optionalItem.isPresent()) {
            MenuItems item = optionalItem.get();
            item.setItemName(itemName);
            item.setCategory(category);
            item.setSmallPortionPrice(smallPortionPrice);
            item.setMediumPortionPrice(mediumPortionPrice);
            item.setLargePortionPrice(largePortionPrice);
            item.setOffer(offer);
            item.setAvailabilityStatus(availabilityStatus);
            item.setDescription(description);
            if (file != null && !file.isEmpty()) {
                item.setImage(file.getBytes()); // Update image if provided
            }
            return ItemRepository.save(item);
        }
        return null; // Item not found
    }

    @Override
    public boolean deleteMenuItem(Long id) {
        if (ItemRepository.existsById(id)) {
            ItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<MenuItems> getMenuItemsByRestaurantId(Long restaurantId) {
        return ItemRepository.findByRestaurantId(restaurantId);
    }
}
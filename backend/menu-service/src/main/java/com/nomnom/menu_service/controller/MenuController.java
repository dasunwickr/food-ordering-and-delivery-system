package com.nomnom.menu_service.controller;

import com.nomnom.menu_service.model.MenuItems;
import com.nomnom.menu_service.repository.MenuItemServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuItemServiceInterface menuService; // Use the interface here

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItems> addMenu(
            @RequestParam("itemName") String itemName,
            @RequestParam("restaurantId")Long restaurantId,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam("availabilityStatus") String availabilityStatus,
            @RequestParam("description") String description,
            @RequestParam("image") MultipartFile file) throws IOException {

        Boolean isAvailable = Boolean.parseBoolean(availabilityStatus);

        MenuItems menuItem = menuService.saveItem(itemName,restaurantId, price, category, isAvailable, description, file);
        return ResponseEntity.ok(menuItem);
    }

    @GetMapping("/all")
    public List<MenuItems> getMenuItems() {
        return menuService.getAllMenuItems();
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getUserImage(@PathVariable Long id) {
        byte[] imageData = menuService.getUserImage(id);
        if (imageData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Adjust based on stored image format
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"user-image.jpg\"")
                .body(imageData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItems> getMenuItemById(@PathVariable Long id) {
        MenuItems menuItem = menuService.getMenuItemById(id);
        if (menuItem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(menuItem);
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItems> updateMenuItem(
            @PathVariable Long id,
            @RequestParam("itemName") String itemName,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam("availabilityStatus") String availabilityStatus,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile file) throws IOException {

        Boolean isAvailable = Boolean.parseBoolean(availabilityStatus);
        MenuItems updatedItem = menuService.updateMenuItem(id, itemName, price, category, isAvailable, description, file);

        if (updatedItem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMenuItem(@PathVariable Long id) {
        boolean deleted = menuService.deleteMenuItem(id);
        if (deleted) {
            return ResponseEntity.ok("Menu item deleted successfully.");
        } else {
            return ResponseEntity.status(404).body("Menu item not found.");
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItems>> getMenuItemsByRestaurantId(@PathVariable Long restaurantId) {
        List<MenuItems> menuItems = menuService.getMenuItemsByRestaurantId(restaurantId);

        if (menuItems.isEmpty()) {
            return ResponseEntity.noContent().build(); // Return 204 No Content if no items found
        }

        return ResponseEntity.ok(menuItems); // Return 200 OK with the list of menu items
    }
}
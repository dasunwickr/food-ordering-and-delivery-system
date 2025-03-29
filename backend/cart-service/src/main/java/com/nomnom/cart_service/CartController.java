package com.nomnom.cart_service;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    // Get cart for a specific customer and restaurant
    @GetMapping("/{customerId}/{restaurantId}")
    public Cart getCart(@PathVariable String customerId, @PathVariable String restaurantId) {
        return cartService.getCart(customerId, restaurantId);
    }

    // Add an item to the cart for a specific customer and restaurant
    @PostMapping("/add/{customerId}/{restaurantId}")
    public Cart addItemToCart(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @RequestBody CartItem item) {
        return cartService.addItemToCart(customerId, restaurantId, item);
    }

    // Update the quantity of an item in the cart
    @PutMapping("/update/{customerId}/{restaurantId}/{itemId}")
    public Cart updateCartItemQuantity(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @PathVariable String itemId,
            @RequestParam int newQuantity) {
        return cartService.updateCartItemQuantity(customerId, restaurantId, itemId, newQuantity);
    }

    // Remove an item from the cart
    @DeleteMapping("/remove/{customerId}/{restaurantId}/{itemId}")
    public Cart removeItemFromCart(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @PathVariable String itemId) {
        return cartService.removeItemFromCart(customerId, restaurantId, itemId);
    }

    // Clear the cart for a specific customer and restaurant
    @DeleteMapping("/clear/{customerId}/{restaurantId}")
    public void clearCart(@PathVariable String customerId, @PathVariable String restaurantId) {
        cartService.clearCart(customerId, restaurantId);
    }

    @GetMapping("/getAll")
    public List<Cart> getAllCarts() {
        return cartService.getAllCarts();
    }
}
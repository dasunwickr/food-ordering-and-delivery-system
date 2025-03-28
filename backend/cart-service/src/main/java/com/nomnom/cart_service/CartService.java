package com.nomnom.cart_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    // Create a new cart for a specific customer and restaurant
    private Cart createNewCart(String customerId, String restaurantId) {
        Cart cart = new Cart();
        cart.setCustomerId(customerId);
        cart.setRestaurantId(restaurantId);
        return cartRepository.save(cart);
    }

    // Get cart by customer ID and restaurant ID
    public Cart getCart(String customerId, String restaurantId) {
        return cartRepository.findByCustomerIdAndRestaurantId(customerId, restaurantId)
                .orElseGet(() -> createNewCart(customerId, restaurantId));
    }

    // Add an item to the cart
    public Cart addItemToCart(String customerId, String restaurantId, CartItem item) {
        Cart cart = getCart(customerId, restaurantId);

        // Check if the item already exists in the cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(item.getItemId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // If the item exists, update its quantity and recalculate the price
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());
            cartItem.setPrice(calculateItemPrice(cartItem.getItemName(), cartItem.getQuantity()));
        } else {
            // If the item does not exist, add it to the cart
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    // Update the quantity of an item in the cart
    public Cart updateCartItemQuantity(String customerId, String restaurantId, String itemId, int newQuantity) {
        Cart cart = getCart(customerId, restaurantId);

        // Find the item in the cart
        Optional<CartItem> optionalCartItem = cart.getItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst();

        if (optionalCartItem.isPresent()) {
            CartItem cartItem = optionalCartItem.get();

            if (newQuantity <= 0) {
                // Remove the item if the new quantity is zero or negative
                cart.getItems().remove(cartItem);
            } else {
                // Update the quantity and recalculate the price
                cartItem.setQuantity(newQuantity);
                cartItem.setPrice(calculateItemPrice(cartItem.getItemName(), cartItem.getQuantity()));
            }
        }

        return cartRepository.save(cart);
    }

    // Remove an item from the cart
    public Cart removeItemFromCart(String customerId, String restaurantId, String itemId) {
        Cart cart = getCart(customerId, restaurantId);

        // Find the item in the cart
        Optional<CartItem> optionalCartItem = cart.getItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst();

        if (optionalCartItem.isPresent()) {
            // Remove the item from the cart
            cart.getItems().remove(optionalCartItem.get());
        }

        return cartRepository.save(cart);
    }

    // Clear a specific cart
    public void clearCart(String customerId, String restaurantId) {
        cartRepository.deleteByCustomerIdAndRestaurantId(customerId, restaurantId);
    }

    // Helper method to calculate the price of an item based on its name and quantity
    private double calculateItemPrice(String itemName, int quantity) {
        // Example pricing logic (you can replace this with actual pricing data from a database or service)
        double basePrice = switch (itemName.toLowerCase()) {
            case "pizza" -> 10.99;
            case "burger" -> 5.99;
            case "pasta" -> 8.99;
            default -> 0.0; // Default price if item name is not recognized
        };
        return basePrice * quantity;
    }
}
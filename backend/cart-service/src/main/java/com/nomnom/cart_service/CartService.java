package com.nomnom.cart_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        cart.getItems().add(item);
        return cartRepository.save(cart);
    }

    // Clear a specific cart
    public void clearCart(String customerId, String restaurantId) {
        cartRepository.deleteByCustomerIdAndRestaurantId(customerId, restaurantId);
    }
}




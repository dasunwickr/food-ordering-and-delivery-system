package com.nomnom.cart_service.service;

import com.nomnom.cart_service.model.Cart;
import com.nomnom.cart_service.model.CartItem;
import com.nomnom.cart_service.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService implements ICart {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    private Cart createNewCart(String customerId, String restaurantId) {
        Cart cart = new Cart();
        cart.setCustomerId(customerId);
        cart.setRestaurantId(restaurantId);
        return cartRepository.save(cart);
    }

    @Override
    public Cart getCart(String customerId, String restaurantId) {
        return cartRepository.findByCustomerIdAndRestaurantId(customerId, restaurantId)
                .orElseGet(() -> createNewCart(customerId, restaurantId));
    }

    @Override
    public Cart addItemToCart(String customerId, String restaurantId, CartItemRequest item) {
        Cart cart = getCart(customerId, restaurantId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(item.getItemId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());
            cartItem.setPrice(calculateItemPrice(cartItem.getItemName(), cartItem.getQuantity()));
            cartItem.updateTotalPrice();
        } else {
            CartItem newItem = new CartItem(
                    item.getItemId(),
                    item.getItemName(),
                    item.getQuantity(),
                    calculateItemPrice(item.getItemName(), item.getQuantity()),
                    0
            );
            newItem.updateTotalPrice();
            cart.getItems().add(newItem);
        }

        cart.recalculateTotalPrice();
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateCartItemQuantity(String customerId, String restaurantId, String itemId, int newQuantity) {
        Cart cart = getCart(customerId, restaurantId);

        Optional<CartItem> optionalCartItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst();

        if (optionalCartItem.isPresent()) {
            CartItem cartItem = optionalCartItem.get();

            if (newQuantity <= 0) {
                cart.getItems().remove(cartItem);
            } else {
                cartItem.setQuantity(newQuantity);
                cartItem.setPrice(calculateItemPrice(cartItem.getItemName(), cartItem.getQuantity()));
                cartItem.updateTotalPrice();
            }
        }

        cart.recalculateTotalPrice();
        return cartRepository.save(cart);
    }

    @Override
    public Cart removeItemFromCart(String customerId, String restaurantId, String itemId) {
        Cart cart = getCart(customerId, restaurantId);

        cart.getItems().removeIf(item -> item.getItemId().equals(itemId));
        cart.recalculateTotalPrice();

        return cartRepository.save(cart);
    }

    @Override
    public void clearCart(String customerId, String restaurantId) {
        cartRepository.deleteByCustomerIdAndRestaurantId(customerId, restaurantId);
    }

    @Override
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    private double calculateItemPrice(String itemName, int quantity) {
        double basePrice = switch (itemName.toLowerCase()) {
            case "pizza" -> 10.99;
            case "burger" -> 5.99;
            case "pasta" -> 8.99;
            default -> 0.0;
        };
        return basePrice * quantity;
    }

    public static class CartItemRequest {
        private String itemId;
        private String itemName;
        private int quantity;

        public String getItemId() {
            return itemId;
        }

        public void setItemId(String itemId) {
            this.itemId = itemId;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}
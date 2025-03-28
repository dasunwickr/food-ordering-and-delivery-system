package com.nomnom.order_service;

import com.nomnom.cart_service.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CartClient {

    @Autowired
    private RestTemplate restTemplate;

    private static final String CART_SERVICE_URL = "http://cart-service/api/cart";

    // Fetch cart by customer ID and restaurant ID
    public Cart getCart(String customerId, String restaurantId) {
        try {
            String url = String.format("%s/%s/%s", CART_SERVICE_URL, customerId, restaurantId);
            return restTemplate.getForObject(url, Cart.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch cart from Cart service", e);
        }
    }
}
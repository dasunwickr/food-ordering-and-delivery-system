package com.nomnom.cart_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {

    private String itemId;
    private String itemName;
    private int quantity;
    private double price;
    private double totalPrice;

    // Helper method to update the total price when quantity changes
    public void updateTotalPrice() {
        this.totalPrice = this.price * this.quantity;
    }
}
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
    public enum PotionSize {
        Small,Medium,Large
    };
    private PotionSize potionSize;
    private double price;
    private double totalPrice;

    public void updateTotalPrice() {
        this.totalPrice = this.price * this.quantity; // Recalculate total price
    }
}
package com.nomnom.order_service.model;

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
}
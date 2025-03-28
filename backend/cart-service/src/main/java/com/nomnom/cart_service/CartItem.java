package com.nomnom.cart_service;

import lombok.Data;

@Data
public class CartItem {

    private String itemId;
    private String itemName;
    private int quantity;
    private double price;
}
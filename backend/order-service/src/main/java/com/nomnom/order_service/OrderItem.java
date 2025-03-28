package com.nomnom.order_service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class OrderItem {

    private String itemId;
    private String itemName;
    private int quantity;
    private double price;
}
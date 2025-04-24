package com.nomnom.cart_service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddItemToCartRequest {
    private String itemId;
    private String itemName;
    private int quantity;
}
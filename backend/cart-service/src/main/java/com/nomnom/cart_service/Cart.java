package com.nomnom.cart_service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "carts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cart {

    @Id
    private String id;
    private String customerId;
    private String restaurantId;
    private List<CartItem> items = new ArrayList<>();
}
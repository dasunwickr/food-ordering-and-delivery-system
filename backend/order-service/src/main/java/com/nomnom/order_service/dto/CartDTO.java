package com.nomnom.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
    private String id;
    private String customerId;
    private String restaurantId;
    private List<CartItemDTO> items;
    private double totalPrice;
    private Date createdAt;
    private Date updatedAt;
}
package com.nomnom.order_service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderRequest {
    private String customerId;
    private String restaurantId;
    private String customerName;
    private String customerContact;
    private String deliveryLocation;
    private String paymentType;
}
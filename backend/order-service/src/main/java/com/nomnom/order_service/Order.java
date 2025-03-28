package com.nomnom.order_service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    private String id;
    private String customerId;
    private CustomerDetails customerDetails;
    private List<OrderItem> items; // Cart items converted to order items
    private double orderTotal;
    private double deliveryFee;
    private double totalAmount; // Order Total + Delivery Fee
    private String paymentType; // "CASH", "CARD"
    private String status; // "PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "CANCELLED"
    private DriverDetails driverDetails;
}
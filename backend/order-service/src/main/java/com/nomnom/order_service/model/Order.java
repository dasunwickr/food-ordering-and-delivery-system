package com.nomnom.order_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Document(collection = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    @Id
    private String orderId;
    private String customerId;
    private CustomerDetails customerDetails;
    private List<CartItem> cartItems;
    private double orderTotal;
    private double deliveryFee;
    private double totalAmount;
    private String paymentType;
    private String orderStatus;
    private DriverDetails driverDetails; // Ensure this field exists
    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CustomerDetails {
        private String name;
        private String contact;
        private String location;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CartItem {
        private String itemId;
        private String itemName;
        private int quantity;
        private double price;
        private double totalPrice;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DriverDetails {
        private String driverId;
        private String driverName;
        private String vehicleNumber;
    }
}
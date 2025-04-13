package com.nomnom.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private String orderId;
    private String customerId;
    private CustomerDetailsDTO customerDetails;
    private List<CartItemDTO> cartItems;
    private double orderTotal;
    private double deliveryFee;
    private double totalAmount;
    private String paymentType;
    private String orderStatus;
    private DriverDetailsDTO driverDetails; // Ensure this field exists
    private Date createdAt;
    private Date updatedAt;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CustomerDetailsDTO {
        private String name;
        private String contact;
        private String location;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CartItemDTO {
        private String itemId;
        private String itemName;
        private int quantity;
        private double price;
        private double totalPrice;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DriverDetailsDTO {
        private String driverId;
        private String driverName;
        private String vehicleNumber;
    }
}
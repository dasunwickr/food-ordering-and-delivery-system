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
    private DriverDetailsDTO driverDetails;
    private Date createdAt;
    private Date updatedAt;

    public static class CustomerDetailsDTO {
        public CustomerDetailsDTO(Object name, Object contact, Object location) {
        }
    }

    public static class CartItemDTO {
        public CartItemDTO(Object itemId, Object itemName, Object quantity, Object price, Object totalPrice) {
        }
    }
}
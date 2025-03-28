package com.nomnom.order_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Create an order from the cart
    @PostMapping("/create/{customerId}/{restaurantId}")
    public Order createOrder(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @RequestParam String paymentType,
            @RequestParam String location) {
        return orderService.createOrderFromCart(customerId, restaurantId, paymentType, location);
    }

    // Get all orders for a specific customer
    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(@PathVariable String customerId) {
        return orderService.getOrdersByCustomer(customerId);
    }

    // Get a specific order by order ID and customer ID
    @GetMapping("/{orderId}/customer/{customerId}")
    public Order getOrderByIdAndCustomerId(
            @PathVariable String orderId,
            @PathVariable String customerId) {
        return orderService.getOrderByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // Update an order
    @PutMapping("/update/{orderId}/customer/{customerId}")
    public Order updateOrder(
            @PathVariable String orderId,
            @PathVariable String customerId,
            @RequestBody Order updatedOrder) {
        return orderService.updateOrder(orderId, customerId, updatedOrder);
    }

    // Delete an order
    @DeleteMapping("/delete/{orderId}/customer/{customerId}")
    public void deleteOrder(
            @PathVariable String orderId,
            @PathVariable String customerId) {
        orderService.deleteOrder(orderId, customerId);
    }
}
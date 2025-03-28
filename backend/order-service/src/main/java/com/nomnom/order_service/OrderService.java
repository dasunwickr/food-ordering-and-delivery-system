package com.nomnom.order_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartClient cartClient;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private DriverService driverService;

    // Create an order from the cart
    public Order createOrderFromCart(String customerId, String restaurantId, String paymentType, String location) {
        // Fetch the cart from the Cart service
        Cart cart = cartClient.getCart(customerId, restaurantId);

        // Convert cart items to order items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> new OrderItem(
                        cartItem.getItemId(),
                        cartItem.getItemName(),
                        cartItem.getQuantity(),
                        cartItem.getPrice()))
                .collect(Collectors.toList());

        // Calculate the order total
        double orderTotal = orderItems.stream()
                .mapToDouble(OrderItem::getPrice)
                .sum();

        // Fetch customer details
        CustomerDetails customerDetails = customerService.getCustomerDetails(customerId);
        customerDetails.setLocation(location); // Update location if needed

        // Assign a driver
        DriverDetails driverDetails = driverService.assignDriver();

        // Calculate delivery fee (example: fixed fee of $5)
        double deliveryFee = 5.0;

        // Calculate total amount
        double totalAmount = orderTotal + deliveryFee;

        // Create the order
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setCustomerDetails(customerDetails);
        order.setItems(orderItems);
        order.setOrderTotal(orderTotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(totalAmount);
        order.setPaymentType(paymentType);
        order.setStatus("PENDING");
        order.setDriverDetails(driverDetails);

        // Save the order to the database
        return orderRepository.save(order);
    }

    // Get all orders for a specific customer
    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    // Get a specific order by order ID and customer ID
    public Optional<Order> getOrderByIdAndCustomerId(String orderId, String customerId) {
        return orderRepository.findByIdAndCustomerId(orderId, customerId);
    }

    // Update an order
    public Order updateOrder(String orderId, String customerId, Order updatedOrder) {
        Optional<Order> optionalOrder = orderRepository.findByIdAndCustomerId(orderId, customerId);
        if (optionalOrder.isPresent()) {
            Order existingOrder = optionalOrder.get();
            existingOrder.setPaymentType(updatedOrder.getPaymentType());
            existingOrder.setStatus(updatedOrder.getStatus());
            existingOrder.setDriverDetails(updatedOrder.getDriverDetails());
            existingOrder.setCustomerDetails(updatedOrder.getCustomerDetails());
            existingOrder.setItems(updatedOrder.getItems());
            existingOrder.setOrderTotal(updatedOrder.getOrderTotal());
            existingOrder.setDeliveryFee(updatedOrder.getDeliveryFee());
            existingOrder.setTotalAmount(updatedOrder.getTotalAmount());
            return orderRepository.save(existingOrder);
        }
        throw new RuntimeException("Order not found");
    }

    // Delete an order
    public void deleteOrder(String orderId, String customerId) {
        Optional<Order> optionalOrder = orderRepository.findByIdAndCustomerId(orderId, customerId);
        if (optionalOrder.isPresent()) {
            orderRepository.deleteById(orderId);
        } else {
            throw new RuntimeException("Order not found");
        }
    }
}
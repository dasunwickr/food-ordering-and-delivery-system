package com.nomnom.order_service.service;

import com.nomnom.order_service.dto.OrderDTO;
import com.nomnom.order_service.model.Order;
import com.nomnom.order_service.repository.OrderRepository;
import com.nomnom.order_service.request.CreateOrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class OrderService implements IOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String CART_SERVICE_URL = "http://localhost:8080/api/cart";

    @Override
    public OrderDTO createOrder(CreateOrderRequest request) {
        // Fetch cart items from Cart Service
        String cartUrl = CART_SERVICE_URL + "/" + request.getCustomerId() + "/" + request.getRestaurantId();
        CartDTO cartDTO = restTemplate.getForObject(cartUrl, CartDTO.class);

        if (cartDTO == null || cartDTO.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate order total
        double orderTotal = cartDTO.getCartItems().stream()
                .mapToDouble(CartDTO.CartItemDTO::getTotalPrice)
                .sum();

        // Create order
        Order order = new Order();
        order.setOrderId(java.util.UUID.randomUUID().toString());
        order.setCustomerId(request.getCustomerId());
        order.setCustomerDetails(new Order.CustomerDetails(
                request.getCustomerName(),
                request.getCustomerContact(),
                request.getDeliveryLocation()
        ));
        order.setCartItems(cartDTO.getCartItems().stream()
                .map(item -> new Order.CartItem(
                        item.getItemId(),
                        item.getItemName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getTotalPrice()
                )).toList());
        order.setOrderTotal(orderTotal);
        order.setDeliveryFee(5.0); // Example fixed delivery fee
        order.setTotalAmount(orderTotal + 5.0);
        order.setPaymentType(request.getPaymentType());
        order.setOrderStatus("Pending");

        // Save order
        Order savedOrder = orderRepository.save(order);
        return mapToOrderDTO(savedOrder);
    }

    @Override
    public OrderDTO getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderDTO(order);
    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(status);
        orderRepository.save(order);
    }

    private OrderDTO mapToOrderDTO(Order order) {
        return new OrderDTO(
                order.getOrderId(),
                order.getCustomerId(),
                new OrderDTO.CustomerDetailsDTO(
                        order.getCustomerDetails().getName(),
                        order.getCustomerDetails().getContact(),
                        order.getCustomerDetails().getLocation()
                ),
                order.getCartItems().stream()
                        .map(item -> new OrderDTO.CartItemDTO(
                                item.getItemId(),
                                item.getItemName(),
                                item.getQuantity(),
                                item.getPrice(),
                                item.getTotalPrice()
                        )).toList(),
                order.getOrderTotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getPaymentType(),
                order.getOrderStatus(),
                new OrderDTO.DriverDetailsDTO(
                        order.getDriverDetails().getDriverId(),
                        order.getDriverDetails().getDriverName(),
                        order.getDriverDetails().getVehicleNumber()
                )
        );
    }
}
package com.nomnom.order_service.service;

import com.nomnom.order_service.dto.CartDTO;
import com.nomnom.order_service.dto.CartItemDTO;
import com.nomnom.order_service.dto.OrderDTO;
import com.nomnom.order_service.model.Order;
import com.nomnom.order_service.repository.OrderRepository;
import com.nomnom.order_service.request.CreateOrderRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService implements IOrderService {

    @Value("${cart.service.url}")
    private String cartServiceUrl;

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    public OrderService(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public OrderDTO createOrder(CreateOrderRequest request) {
        // Fetch cart items from Cart Service
        String cartUrl = cartServiceUrl + "/" + request.getCustomerId() + "/" + request.getRestaurantId();
        ResponseEntity<CartDTO> response = restTemplate.getForEntity(cartUrl, CartDTO.class);

        if (response.getBody() == null || response.getBody().getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        CartDTO cartDTO = response.getBody();

        // Calculate order total
        double orderTotal = cartDTO.getItems().stream()
                .mapToDouble(item -> item.getTotalPrice())
                .sum();

        // Create order
        Order order = new Order();
        order.setOrderId(UUID.randomUUID().toString());
        order.setCustomerId(request.getCustomerId());
        order.setCustomerDetails(new Order.CustomerDetails(
                request.getCustomerName(),
                request.getCustomerContact(),
                request.getDeliveryLocation()
        ));
        order.setCartItems(cartDTO.getItems().stream()
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

        // Map driver details
        if (request.getDriverDetails() != null) {
            order.setDriverDetails(new Order.DriverDetails(
                    request.getDriverDetails().getDriverId(),
                    request.getDriverDetails().getDriverName(),
                    request.getDriverDetails().getVehicleNumber()
            ));
        }

        order.setCreatedAt(new Date());
        order.setUpdatedAt(new Date());

        // Save order
        Order savedOrder = orderRepository.save(order);
        return mapToOrderDTO(savedOrder);
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
                order.getDriverDetails() != null ? new OrderDTO.DriverDetailsDTO(
                        order.getDriverDetails().getDriverId(),
                        order.getDriverDetails().getDriverName(),
                        order.getDriverDetails().getVehicleNumber()
                ) : null,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
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
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToOrderDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getOrderStatus().equals("Pending")) {
            throw new RuntimeException("Cannot cancel an order that is not Pending");
        }
        order.setOrderStatus("Cancelled");
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }

}
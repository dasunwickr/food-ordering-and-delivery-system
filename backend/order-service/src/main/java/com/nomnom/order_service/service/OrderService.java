package com.nomnom.order_service.service;

import com.nomnom.order_service.dto.CartDTO;
import com.nomnom.order_service.dto.CartItemDTO;
import com.nomnom.order_service.dto.CreateDeliveryDTO;
import com.nomnom.order_service.dto.OrderDTO;
import com.nomnom.order_service.model.Order;
import com.nomnom.order_service.repository.OrderRepository;
import com.nomnom.order_service.request.*;
import com.nomnom.order_service.shared.enums.PotionSize;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.nomnom.order_service.shared.enums.PotionSize.*;

@Service
public class OrderService implements IOrderService {

    @Value("${cart.service.url}")
    private String cartServiceUrl;

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final WebClient.Builder webClientBuilder;
    private final String DELIVERY_SERVICE_URL = "http://delivery-service:5003"; 

    public OrderService(OrderRepository orderRepository, RestTemplate restTemplate, WebClient.Builder webClientBuilder) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public OrderDTO createOrder(CreateOrderRequest request) {
        try {
            // Construct cart URL properly
            String cartUrl = String.format("%s/%s/%s", cartServiceUrl, request.getCustomerId(), request.getRestaurantId());
            System.out.println("Attempting to fetch cart from URL: " + cartUrl);
            
            ResponseEntity<CartDTO> response;
            try {
                response = restTemplate.getForEntity(cartUrl, CartDTO.class);
                System.out.println("Cart service response status: " + response.getStatusCode());
            } catch (Exception e) {
                System.err.println("Failed to connect to Cart Service: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to connect to Cart Service. Please try again later.", e);
            }
            
            if (response.getBody() == null) {
                throw new RuntimeException("Cart is empty or not found");
            }

            if (response.getBody().getItems() == null || response.getBody().getItems().isEmpty()) {
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
            order.setRestaurantId(request.getRestaurantId());
            order.setCustomerDetails(new Order.CustomerDetails(
                    request.getCustomerName(),
                    request.getCustomerContact(),
                    request.getLongitude(),
                    request.getLatitude()
            ));
            order.setCartItems(cartDTO.getItems().stream()
                    .map(item -> new Order.CartItem(
                            item.getItemId(),
                            item.getItemName(),
                            item.getQuantity(),
                            mapPotionSize(item.getPotionSize()),
                            item.getPrice(),
                            item.getTotalPrice(),
                            item.getImage()
                    )).toList());
            order.setOrderTotal(orderTotal);
            order.setDeliveryFee(5.0); 
            order.setTotalAmount(orderTotal + 5.0);
            order.setPaymentType(request.getPaymentType());
            order.setOrderStatus(Order.OrderStatus.PENDING.toString());

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
            System.out.println("Saving order to database: " + order.getOrderId());
            Order savedOrder = orderRepository.save(order);

            // Create a delivery for this order - this won't block the order creation
            try {
                createDeliveryForOrder(savedOrder.getOrderId());
            } catch (Exception e) {
                System.err.println("Failed to create delivery, but order was created: " + e.getMessage());
                // Continue with order creation even if delivery creation fails
            }

            return mapToOrderDTO(savedOrder);
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void createDeliveryForOrder(String orderId) {
        try {
            System.out.println("Attempting to create delivery for order: " + orderId);
            System.out.println("Delivery service URL: " + DELIVERY_SERVICE_URL);
            
            // Use the DTO class instead of anonymous class
            CreateDeliveryDTO request = new CreateDeliveryDTO(orderId);
            
            webClientBuilder.build()
                .post()
                .uri(DELIVERY_SERVICE_URL + "/api/deliveries")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(result -> {
                    System.out.println("Successfully created delivery for order: " + orderId);
                    updateOrderStatus(orderId, Order.OrderStatus.PENDING.toString());
                })
                .doOnError(error -> {
                    System.err.println("Failed to create delivery record: " + error.getMessage());
                    updateOrderStatus(orderId, Order.OrderStatus.PENDING.toString());
                })
                .block();
        } catch (Exception e) {
            System.err.println("Failed to create delivery record: " + e.getMessage());
            e.printStackTrace();
            updateOrderStatus(orderId, Order.OrderStatus.PENDING.toString());
        }
    }

    private Order.CartItem.PotionSize mapPotionSize(PotionSize potionSize) {
        if (potionSize == null) {
            return Order.CartItem.PotionSize.Small; 
        }
        switch (potionSize) {
            case Small: return Order.CartItem.PotionSize.Small;
            case Medium: return Order.CartItem.PotionSize.Medium;
            case Large: return Order.CartItem.PotionSize.Large;
            default: return Order.CartItem.PotionSize.Small;
        }
    }

    private OrderDTO mapToOrderDTO(Order order) {
        return new OrderDTO(
                order.getOrderId(),
                order.getCustomerId(),
                order.getRestaurantId(),
                new OrderDTO.CustomerDetailsDTO(
                        order.getCustomerDetails().getName(),
                        order.getCustomerDetails().getContact(),
                        order.getCustomerDetails().getLongitude(),
                        order.getCustomerDetails().getLatitude()
                ),
                order.getCartItems().stream()
                        .map(item -> new OrderDTO.CartItemDTO(
                                item.getItemId(),
                                item.getItemName(),
                                item.getQuantity(),
                                mapPotionSizeToDTO(item.getPotionSize()), 
                                item.getPrice(),
                                item.getTotalPrice(),
                                item.getImage()
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

    private OrderDTO.CartItemDTO.PotionSize mapPotionSizeToDTO(Order.CartItem.PotionSize potionSize) {
        // Handle null potionSize by assigning a default value
        if (potionSize == null) {
            return OrderDTO.CartItemDTO.PotionSize.Small; // Default to "Small"
        }
        return switch (potionSize) {
            case Small -> OrderDTO.CartItemDTO.PotionSize.Small;
            case Medium -> OrderDTO.CartItemDTO.PotionSize.Medium;
            case Large -> OrderDTO.CartItemDTO.PotionSize.Large;
        };
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
        // Validate and convert the status string to enum
        Order.OrderStatus orderStatus = Order.OrderStatus.fromString(status);
        order.setOrderStatus(orderStatus.toString());
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
        if (!order.getOrderStatus().equals(Order.OrderStatus.PENDING.toString())) {
            throw new RuntimeException("Cannot cancel an order that is not Pending");
        }
        order.setOrderStatus(Order.OrderStatus.CANCELLED.toString());
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }

    @Override
    public void assignDriver(String orderId, AssignDriverRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDriverDetails(new Order.DriverDetails(
                request.getDriverId(),
                request.getDriverName(),
                request.getVehicleNumber()
        ));
        order.setOrderStatus(Order.OrderStatus.OUT_FOR_DELIVERY.toString());
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }

    @Override
    public void applyDiscount(String orderId, ApplyDiscountRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        double discountedAmount = order.getTotalAmount() - request.getDiscountAmount();
        order.setTotalAmount(discountedAmount < 0 ? 0 : discountedAmount);
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }
}

@Data
@AllArgsConstructor
class CreateDeliveryRequest {
    private String orderId;
}
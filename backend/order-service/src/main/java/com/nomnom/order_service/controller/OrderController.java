package com.nomnom.order_service.controller;

import com.nomnom.order_service.dto.OrderDTO;
import com.nomnom.order_service.request.*;
import com.nomnom.order_service.service.IOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final IOrderService orderService;

    public OrderController(IOrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/update-status/{orderId}")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/assign-driver/{orderId}")
    public ResponseEntity<Void> assignDriver(@PathVariable String orderId, @RequestBody AssignDriverRequest request) {
        orderService.assignDriver(orderId, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/apply-discount/{orderId}")
    public ResponseEntity<Void> applyDiscount(@PathVariable String orderId, @RequestBody ApplyDiscountRequest request) {
        orderService.applyDiscount(orderId, request);
        return ResponseEntity.noContent().build();
    }
}
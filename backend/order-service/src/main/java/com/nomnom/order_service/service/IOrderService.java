package com.nomnom.order_service.service;

import com.nomnom.order_service.dto.OrderDTO;
import com.nomnom.order_service.request.CreateOrderRequest;

public interface IOrderService {
    OrderDTO createOrder(CreateOrderRequest request);
    OrderDTO getOrderById(String orderId);
    void updateOrderStatus(String orderId, String status);
}
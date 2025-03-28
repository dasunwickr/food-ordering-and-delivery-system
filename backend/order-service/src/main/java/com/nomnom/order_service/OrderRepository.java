package com.nomnom.order_service;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    // Find all orders by customer ID
    List<Order> findByCustomerId(String customerId);

    // Find an order by order ID and customer ID
    Optional<Order> findByIdAndCustomerId(String orderId, String customerId);
}
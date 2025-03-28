package com.nomnom.cart_service;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByCustomerIdAndRestaurantId(String customerId, String restaurantId);
}

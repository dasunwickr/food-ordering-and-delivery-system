package com.nomnom.user_service.controller;

import com.nomnom.user_service.model.RestaurantType;
import com.nomnom.user_service.service.RestaurantTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RestaurantTypeController {
    private final RestaurantTypeService restaurantTypeService;

    @PostMapping
    public ResponseEntity<RestaurantType> createRestaurantType(@RequestBody RestaurantType type) {
        return ResponseEntity.status(201).body(restaurantTypeService.createRestaurantType(type));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantType>> getAllRestaurantTypes() {
        return ResponseEntity.ok(restaurantTypeService.getAllRestaurantTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantType> getRestaurantTypeById(@PathVariable String id) {
        return restaurantTypeService.getRestaurantTypeById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

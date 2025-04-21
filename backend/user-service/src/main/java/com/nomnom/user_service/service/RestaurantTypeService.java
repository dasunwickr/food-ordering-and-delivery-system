package com.nomnom.user_service.service;

import com.nomnom.user_service.model.RestaurantType;
import com.nomnom.user_service.repository.RestaurantTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RestaurantTypeService {
    private final RestaurantTypeRepository restaurantTypeRepository;

    public RestaurantType createRestaurantType(RestaurantType type) {
        return restaurantTypeRepository.save(type);
    }

    public List<RestaurantType> getAllRestaurantTypes() {
        return restaurantTypeRepository.findAll();
    }

    public Optional<RestaurantType> getRestaurantTypeById(String id) {
        return restaurantTypeRepository.findById(id);
    }
}

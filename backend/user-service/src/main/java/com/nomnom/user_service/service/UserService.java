package com.nomnom.user_service.service;

import com.nomnom.user_service.enums.UserType;
import com.nomnom.user_service.model.*;
import com.nomnom.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;

    public User saveUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (user instanceof Admin) {
            user.setUserType(UserType.ADMIN.name());
        } else if (user instanceof Customer) {
            user.setUserType(UserType.CUSTOMER.name());
        } else if (user instanceof Driver) {
            user.setUserType(UserType.DRIVER.name());
        } else if (user instanceof Restaurant) {
            user.setUserType(UserType.RESTAURANT.name());
        } else {
            throw new IllegalArgumentException("Invalid user type");
        }

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByType(String type) {
        return userRepository.findAll().stream()
                .filter(user -> user.getUserType().equalsIgnoreCase(type))
                .collect(Collectors.toList());
    }

    public User updateUser(String id, User updatedUser) {
        if (userRepository.existsById(id)) {
            updatedUser.setId(id);
            return userRepository.save(updatedUser);
        }
        throw new IllegalArgumentException("User not found");
    }

    public boolean deleteUser(String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public User updateDriverStatus(String id, String status) {
        Optional<User> optional = userRepository.findById(id);
        if (optional.isPresent() && optional.get() instanceof Driver driver) {
            driver.setStatus(status);
            return userRepository.save(driver);
        }
        throw new IllegalArgumentException("Driver not found or invalid ID");
    }

    public User updateRestaurantStatus(String id, String status) {
        Optional<User> optional = userRepository.findById(id);
        if (optional.isPresent() && optional.get() instanceof Restaurant restaurant) {
            restaurant.setStatus(status);
            return userRepository.save(restaurant);
        }
        throw new IllegalArgumentException("Restaurant not found or invalid ID");
    }
}

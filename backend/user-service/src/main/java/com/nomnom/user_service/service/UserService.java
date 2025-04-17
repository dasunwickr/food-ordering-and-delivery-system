package com.nomnom.user_service.service;

import com.nomnom.user_service.model.*;
import com.nomnom.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User saveUser(User user) {
        // Validate unique email and username
        if (userRepository.findByEmail(user.getEmail()).isPresent() ||
                userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Email or username already exists");
        }

        // Hash the password
        user.setPassword(hashPassword(user.getPassword()));

        // Determine user type based on subclass
        if (user instanceof Admin admin) {
            user.setUserType("admin");
            if (admin.getSuperAdmin() != null) {
                // Optional validation for super admin existence can be added
            }
        } else if (user instanceof Customer) {
            user.setUserType("customer");
            // No need to store order history in user model
        } else if (user instanceof Driver driver) {
            user.setUserType("driver");
            // assignedOrders handled on Order Service side
        } else if (user instanceof RestaurantOwner owner) {
            user.setUserType("restaurantOwner");
            if (owner.getRestaurantDocuments() != null) {
                owner.getRestaurantDocuments().forEach(doc -> {
                    if (doc.getName() == null || doc.getUrl() == null) {
                        throw new IllegalArgumentException("Document name and URL are required.");
                    }
                });
            }
        } else {
            throw new IllegalArgumentException("Invalid user type");
        }

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(String id, User updatedUser) {
        Optional<User> existingUserOpt = userRepository.findById(id);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // Retain the original password if not updated
            if (updatedUser.getPassword() == null || updatedUser.getPassword().isBlank()) {
                updatedUser.setPassword(existingUser.getPassword());
            } else {
                updatedUser.setPassword(hashPassword(updatedUser.getPassword()));
            }

            updatedUser.setId(id);
            updatedUser.setUserType(existingUser.getUserType()); // Preserve user type

            return userRepository.save(updatedUser);
        }
        return null;
    }

    public boolean deleteUser(String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
}

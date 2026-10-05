package com.omtb.backend.controllers;

import com.omtb.backend.models.User;
import com.omtb.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            response.put("success", false);
            response.put("message", "Error: Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }

        if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
            response.put("success", false);
            response.put("message", "Error: Username is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        // Normally you encrypt the password here before saving
        // user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("customer");
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> response = new HashMap<>();
        String identifier = loginRequest.get("identifier");
        String password = loginRequest.get("password");

        return userRepository.findByEmailOrUsername(identifier, identifier)
                .filter(user -> user.getPassword().equals(password))
                .map(user -> {
                    response.put("success", true);
                    response.put("message", "Login successful");
                    // Important: Send user data back to the frontend
                    response.put("user", user); 
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "Invalid email or password");
                    return ResponseEntity.badRequest().body(response);
                });
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User updatedUser) {
        Map<String, Object> response = new HashMap<>();

        return userRepository.findById(updatedUser.getId())
                .map(existingUser -> {
                    if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
                        existingUser.setUsername(updatedUser.getUsername());
                    }
                    if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                        existingUser.setEmail(updatedUser.getEmail());
                    }
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                        existingUser.setPassword(updatedUser.getPassword());
                    }
                    
                    userRepository.save(existingUser);
                    
                    response.put("success", true);
                    response.put("message", "Profile updated successfully");
                    response.put("user", existingUser);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "User not found");
                    return ResponseEntity.badRequest().body(response);
                });
    }
}

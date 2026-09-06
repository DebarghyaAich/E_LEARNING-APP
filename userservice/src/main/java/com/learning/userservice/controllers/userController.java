package com.learning.userservice.controllers;

import com.learning.userservice.Dtos.RegisterRequest;
import com.learning.userservice.Dtos.RegisterResponse;
import com.learning.userservice.Dtos.UserProfileResponse;
import com.learning.userservice.services.UserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class userController {

    private final UserServiceImpl userServiceImpl;
    public userController(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUser( @RequestParam ("userId") Long userID) {
        return ResponseEntity.ok(userServiceImpl.getUserProfile(userID));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody @Valid RegisterRequest registerRequest) {
        RegisterResponse registerResponse = userServiceImpl.registerUser(registerRequest);
        return ResponseEntity.status(HttpStatus.OK).body(registerResponse);
    }
}

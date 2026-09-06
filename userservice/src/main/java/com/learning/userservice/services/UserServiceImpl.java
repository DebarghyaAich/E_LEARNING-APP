package com.learning.userservice.services;

import com.learning.userservice.Dtos.RegisterRequest;
import com.learning.userservice.Dtos.RegisterResponse;
import com.learning.userservice.Dtos.UserProfileResponse;
import com.learning.userservice.Entity.User;
import com.learning.userservice.errors.EmailAlreadyExistsException;
import com.learning.userservice.errors.PasswordNotMatchException;
import com.learning.userservice.errors.UserNotFoundException;
import com.learning.userservice.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements  userService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public RegisterResponse registerUser(RegisterRequest registerRequest) {
        if(userRepository.existsByEmail(registerRequest.getEmail())){
           throw new EmailAlreadyExistsException("This email is already registered.");
        }

        // password matcher
        if(!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())){
            throw new PasswordNotMatchException("Incorrect username or Password.");
        }
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(registerRequest.getPassword())
                .firstname(registerRequest.getFirstName())
                .lastname(registerRequest.getLastName())
                .build();

         userRepository.save(user);
         return RegisterResponse.builder()
                 .success(true)
                 .message(user.getFirstname()+" "+user.getLastname()+" registered Successfully.")
                 .registerAt(LocalDateTime.now())
                 .build();

    }

    @Override
    public UserProfileResponse getUserProfile(Long userID) {
        User user = userRepository.findById(Long.valueOf(userID))
                .orElseThrow(()-> new UserNotFoundException("User Doesn't exists."));
        return UserProfileResponse.builder()
                .userID(userID)
                .firstName(user.getFirstname())
                .lastName(user.getLastname())
                .email(user.getEmail())
                .build();
    }
}

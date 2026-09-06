package com.learning.userservice.services;

import com.learning.userservice.Dtos.RegisterRequest;
import com.learning.userservice.Dtos.RegisterResponse;
import com.learning.userservice.Dtos.UserProfileResponse;

public interface userService {
    RegisterResponse registerUser(RegisterRequest registerRequest);

    UserProfileResponse getUserProfile(Long userID);
}

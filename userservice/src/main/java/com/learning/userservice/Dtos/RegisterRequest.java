package com.learning.userservice.Dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotNull(message = "can not be empty")
    private String firstName;
    @NotNull(message = "can not be null.")
    private String lastName;
    @NotNull(message = "Email is required.")
    @Email(message = "Invalid email format.")
    private String email;
    @NotNull(message = "password is required")
    @Size(min = 6,message = "min password size is 6.")
    private String password;
    @NotNull(message = "confirm you above password.")
    private String confirmPassword;
}

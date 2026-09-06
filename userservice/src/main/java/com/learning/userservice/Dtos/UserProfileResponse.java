package com.learning.userservice.Dtos;

import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse{
    private boolean success;
    private Long userID;
    private String firstName;
    private String lastName;
    private String email;

}

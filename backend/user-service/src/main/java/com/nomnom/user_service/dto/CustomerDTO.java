package com.nomnom.user_service.dto;


import lombok.Data;
import java.util.List;

@Data
public class CustomerDTO extends UserDTO {
    private List<String> orderHistory;
}

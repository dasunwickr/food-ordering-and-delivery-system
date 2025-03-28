package com.nomnom.order_service;

import lombok.Data;

@Data
public class CustomerDetails {
    private String name;
    private String contact;
    private String location; // Can be updated dynamically
}
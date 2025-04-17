package com.nomnom.user_service.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class Customer extends User {

}

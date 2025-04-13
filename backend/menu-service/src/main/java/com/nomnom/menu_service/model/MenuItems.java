package com.nomnom.menu_service.model;


import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private String description;
    private double price;
    private String category;
    private Boolean availabilityStatus;

    @Lob  // Large Object - used to store binary data
    @Column(columnDefinition = "LONGBLOB") // Specify BLOB type for MySQL
    private byte[] image;

    public MenuItems() {}

    public MenuItems(String itemName,double price,String category,Boolean availabilityStatus, String description, byte[] image) {
        this.itemName = itemName;
        this.category = category;
        this.availabilityStatus = availabilityStatus;
        this.price = price;
        this.description = description;
        this.image = image;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(Boolean availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }
}

package com.nomnom.menu_service.model;


import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long restaurantId;
    private String itemName;
    private String description;
    private String category;
    private Boolean availabilityStatus;
    private double smallPortionPrice;
    private double mediumPortionPrice;
    private double largePortionPrice;

    @Column(nullable = true)
    private double offer;

    @Lob  // Large Object - used to store binary data
    @Column(columnDefinition = "LONGBLOB") // Specify BLOB type for MySQL
    private byte[] image;

    public MenuItems() {}

    public MenuItems(String itemName,double smallPortionPrice,double mediumPortionPrice,double largePortionPrice,double offer,String category,Boolean availabilityStatus, String description, byte[] image) {
        this.itemName = itemName;
        this.category = category;
        this.availabilityStatus = availabilityStatus;
        this.description = description;
        this.image = image;
        this.smallPortionPrice = smallPortionPrice;
        this.mediumPortionPrice = mediumPortionPrice;
        this.largePortionPrice = largePortionPrice;
        this.offer = offer;
    }



    public double getSmallPortionPrice() {
        return smallPortionPrice;
    }

    public void setSmallPortionPrice(double smallPortionPrice) {
        this.smallPortionPrice = smallPortionPrice;
    }

    public double getMediumPortionPrice() {
        return mediumPortionPrice;
    }

    public void setMediumPortionPrice(double mediumPortionPrice) {
        this.mediumPortionPrice = mediumPortionPrice;
    }

    public double getLargePortionPrice() {
        return largePortionPrice;
    }

    public void setLargePortionPrice(double largePortionPrice) {
        this.largePortionPrice = largePortionPrice;
    }

    public double getOffer() {
        return offer;
    }

    public void setOffer(double offer) {
        this.offer = offer;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
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

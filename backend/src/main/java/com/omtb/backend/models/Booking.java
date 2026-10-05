package com.omtb.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String movieId;
    private String movieName;
    private String theater;
    private String date;
    private String time;
    private List<String> seats;
    private Double total;
    private String userId;
    private String userName;
    private String userEmail;
}

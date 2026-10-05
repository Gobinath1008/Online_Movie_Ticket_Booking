package com.omtb.backend.controllers;

import com.omtb.backend.models.Booking;
import com.omtb.backend.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingRepository.findByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(savedBooking);
    }

    @PutMapping
    public ResponseEntity<Booking> updateBooking(@RequestBody Booking booking) {
        if (!bookingRepository.existsById(booking.getId())) {
            return ResponseEntity.notFound().build();
        }
        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(updatedBooking);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteBooking(@RequestBody Booking booking) {
        if (!bookingRepository.existsById(booking.getId())) {
            return ResponseEntity.notFound().build();
        }
        bookingRepository.deleteById(booking.getId());
        return ResponseEntity.ok().build();
    }
}

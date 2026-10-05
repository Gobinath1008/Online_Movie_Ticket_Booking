package com.omtb.backend.controllers;
import com.omtb.backend.models.Movie;
import com.omtb.backend.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {
    @Autowired private MovieRepository movieRepository;

    @GetMapping
    public List<Movie> getAllMovies() { return movieRepository.findAll(); }

    @GetMapping("/{id}")
    public Movie getMovie(@PathVariable String id) { return movieRepository.findById(id).orElse(null); }
    
    @PostMapping
    public List<Movie> saveAllMovies(@RequestBody List<Movie> movies) {
        movieRepository.deleteAll();
        return movieRepository.saveAll(movies);
    }
}
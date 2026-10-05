package com.omtb.backend.models;

import lombok.Data;
import java.util.List;

@Data
public class Theater {
    private String tname;
    private String name;
    private String date;
    private String location;
    private List<String> timings;
}

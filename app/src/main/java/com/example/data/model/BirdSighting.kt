package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bird_sightings")
data class BirdSighting(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val speciesName: String,
    val hotspotName: String,
    val dateDisplay: String,
    val timestamp: Long = System.currentTimeMillis(),
    val count: Int = 1,
    val cameraGear: String = "",
    val lensFocalLength: String = "",
    val shutterSpeed: String = "",
    val aperture: String = "",
    val iso: String = "",
    val photoRating: Int = 4, // 1 to 5 stars
    val notes: String = "",
    val isFavorite: Boolean = false
)

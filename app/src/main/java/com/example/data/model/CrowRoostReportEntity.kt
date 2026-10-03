package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "crow_roost_reports")
data class CrowRoostReportEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val species: String = "American Crow",
    val count: Int,
    val locationName: String,
    val lat: Double,
    val lng: Double,
    val flightDirection: String, // "SW toward Downtown", "West across River", "Circling", "Roosting"
    val behavior: String,        // "Mega-Roost", "Staging", "Flyover Stream", "Foraging"
    val notes: String,
    val timestamp: Long = System.currentTimeMillis()
)

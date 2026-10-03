package com.example.data.model

import com.example.ui.theme.FlockAmber
import com.example.ui.theme.FlockCrimson
import com.example.ui.theme.FlockOrange
import com.example.ui.theme.FlockTeal
import androidx.compose.ui.graphics.Color

data class EBirdObservation(
    val id: String = java.util.UUID.randomUUID().toString(),
    val speciesCode: String,
    val comName: String,
    val sciName: String,
    val locId: String = "",
    val locName: String,
    val obsDt: String,
    val howMany: Int = 1,
    val lat: Double,
    val lng: Double,
    val obsReviewed: Boolean = true,
    val presenceNoted: Boolean = false,
    val subId: String = "",
    val direction: String? = null, // e.g. "SW", "E", "Circling", "Roosting"
    val isCrowRoost: Boolean = false,
    val notes: String? = null,
    val category: QuickCategory = QuickCategory.ALL
) {
    val checklistUrl: String
        get() = if (subId.isNotBlank()) "https://ebird.org/checklist/$subId" else "https://ebird.org/region/US-OR-051"

    val flockColorHex: String
        get() = when {
            howMany > 500 || isCrowRoost -> "#EF4444" // Vivid Crimson Pulse
            howMany in 101..500 -> "#F97316"          // Deep Orange
            howMany in 21..100 -> "#F59E0B"           // Bright Amber
            else -> "#14B8A6"                         // Soft Teal
        }

    val flockColor: Color
        get() = when {
            howMany > 500 || isCrowRoost -> FlockCrimson
            howMany in 101..500 -> FlockOrange
            howMany in 21..100 -> FlockAmber
            else -> FlockTeal
        }
}

data class EBirdHotspot(
    val locId: String,
    val locName: String,
    val lat: Double,
    val lng: Double,
    val numSpeciesAllTime: Int = 0,
    val latestObsDt: String? = null
)

data class TaxonomyItem(
    val comName: String,
    val sciName: String,
    val speciesCode: String,
    val category: String = "species",
    val familyComName: String = ""
)

enum class QuickCategory(val label: String, val badgeColorHex: Long) {
    ALL("All Observations", 0xFF10B981),
    CROWS("Portland Crows (Winter Roosts)", 0xFFEF4444),
    RAPTORS("Raptors & Owls", 0xFFF59E0B),
    WATERFOWL("Waterfowl & Herons", 0xFF0284C7),
    SONGBIRDS("Migratory Songbirds", 0xFF8B5CF6),
    NOTABLE("Rare / Notable", 0xFFEC4899)
}

data class CommunityRoostReport(
    val id: String = java.util.UUID.randomUUID().toString(),
    val species: String = "American Crow",
    val count: Int,
    val locationName: String,
    val lat: Double,
    val lng: Double,
    val flightDirection: String, // N, S, E, W, NE, NW, SE, SW, Circling, Mega-Roosting
    val behavior: String,        // Staging, Commuting, Roosting, Foraging
    val notes: String,
    val timestamp: Long = System.currentTimeMillis()
)

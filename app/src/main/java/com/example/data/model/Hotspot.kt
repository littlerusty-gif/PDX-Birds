package com.example.data.model

data class Hotspot(
    val id: String,
    val name: String,
    val region: OregonRegion,
    val latitude: Double,
    val longitude: Double,
    val habitatType: String,
    val primarySpecies: List<String>,
    val peakMonths: String,
    val photoVantagePoint: String,
    val bestPhotoTime: String,
    val recommendedLens: String,
    val recommendedSettings: String,
    val photoScore: Float, // out of 5.0
    val blindAvailable: Boolean,
    val lightingDirection: String,
    val accessNotes: String,
    val description: String
)

enum class OregonRegion(val displayName: String, val badgeColorHex: Long) {
    COAST("Oregon Coast", 0xFF00838F),
    WILLAMETTE_GORGE("Willamette & Gorge", 0xFF2E7D32),
    CASCADES_CENTRAL("Cascades & High Desert", 0xFF5D4037),
    KLAMATH_BASIN("Southern & Klamath Basin", 0xFF0277BD),
    MALHEUR_EASTERN("Eastern & Malheur Basin", 0xFFE65100)
}

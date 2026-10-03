package com.example.data.model

data class BirdSpecies(
    val id: String,
    val commonName: String,
    val scientificName: String,
    val category: BirdCategory,
    val migrationSeason: String,
    val peakActivity: String,
    val status: MigrationStatus,
    val oregonRange: String,
    val identificationMarks: String,
    val photoTips: String,
    val recommendedShutterSpeed: String,
    val recommendedFocalLength: String,
    val callDescription: String,
    val bestHotspotIds: List<String>
)

enum class BirdCategory(val label: String) {
    RAPTOR("Raptor"),
    WATERFOWL("Waterfowl"),
    SHOREBIRD("Shorebird & Wader"),
    SONGBIRD("Songbird"),
    SEABIRD("Pelagic & Seabird"),
    AERIAL("Swifts & Hummingbirds")
}

enum class MigrationStatus(val label: String, val badgeColorHex: Long) {
    ACTIVE_MIGRATION("Active Migration", 0xFF2E7D32),
    BREEDING_SUMMER("Nesting / Summer", 0xFFF5A623),
    WINTERING("Wintering Grounds", 0xFF1976D2),
    YEAR_ROUND("Year-Round Resident", 0xFF7B1FA2)
}

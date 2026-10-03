package com.example.data.repository

import com.example.data.local.BirdDao
import com.example.data.local.OregonFlywayData
import com.example.data.model.BirdSighting
import com.example.data.model.BirdSpecies
import com.example.data.model.Hotspot
import com.example.data.model.OregonRegion
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class BirdRepository(private val birdDao: BirdDao) {

    // Hotspots and curated data
    fun getHotspots(): List<Hotspot> = OregonFlywayData.hotspots

    fun getHotspotsByRegion(region: OregonRegion): List<Hotspot> {
        return OregonFlywayData.hotspots.filter { it.region == region }
    }

    fun getHotspotById(id: String): Hotspot? {
        return OregonFlywayData.hotspots.find { it.id == id }
    }

    fun getSpeciesList(): List<BirdSpecies> = OregonFlywayData.speciesList

    fun getSpeciesById(id: String): BirdSpecies? {
        return OregonFlywayData.speciesList.find { it.id == id }
    }

    // Room Database for sightings
    val allSightings: Flow<List<BirdSighting>> = birdDao.getAllSightings()
    val favoriteSightings: Flow<List<BirdSighting>> = birdDao.getFavoriteSightings()
    val sightingCount: Flow<Int> = birdDao.getSightingCount()

    suspend fun insertSighting(sighting: BirdSighting): Long = birdDao.insertSighting(sighting)

    suspend fun updateSighting(sighting: BirdSighting) = birdDao.updateSighting(sighting)

    suspend fun deleteSighting(sighting: BirdSighting) = birdDao.deleteSighting(sighting)

    suspend fun deleteById(id: Long) = birdDao.deleteById(id)

    suspend fun seedInitialSightingsIfEmpty() {
        val count = sightingCount.firstOrNull() ?: 0
        if (count == 0) {
            val sampleSightings = listOf(
                BirdSighting(
                    speciesName = "Tufted Puffin",
                    hotspotName = "Haystack Rock (Cannon Beach)",
                    dateDisplay = "Aug 14",
                    count = 4,
                    cameraGear = "Sony A7IV + 200-600mm",
                    lensFocalLength = "600mm",
                    shutterSpeed = "1/3200s",
                    aperture = "f/6.3",
                    iso = "ISO 400",
                    photoRating = 5,
                    notes = "Captured landing sequence onto upper grassy ledge with bill full of smelt. Golden hour light was breathtaking!",
                    isFavorite = true
                ),
                BirdSighting(
                    speciesName = "Sandhill Crane",
                    hotspotName = "Malheur National Wildlife Refuge",
                    dateDisplay = "May 2",
                    count = 18,
                    cameraGear = "Canon R5 + 100-500mm",
                    lensFocalLength = "500mm",
                    shutterSpeed = "1/2000s",
                    aperture = "f/7.1",
                    iso = "ISO 320",
                    photoRating = 5,
                    notes = "Spectacular bugling pair dancing in shallow marsh reflection against snowy Steens Mountain rim.",
                    isFavorite = true
                ),
                BirdSighting(
                    speciesName = "Bald Eagle",
                    hotspotName = "Klamath Basin NWR",
                    dateDisplay = "Jan 22",
                    count = 34,
                    cameraGear = "Nikon Z8 + 500mm f/4",
                    lensFocalLength = "500mm",
                    shutterSpeed = "1/2500s",
                    aperture = "f/4.0",
                    iso = "ISO 500",
                    photoRating = 5,
                    notes = "Massive mature eagle swooping over icy slough at dawn. Frost on feathers visible in crop.",
                    isFavorite = true
                ),
                BirdSighting(
                    speciesName = "Vaux's Swift",
                    hotspotName = "Chapman Elementary School",
                    dateDisplay = "Sep 18",
                    count = 12000,
                    cameraGear = "Fujifilm X-T5 + 50-140mm f/2.8",
                    lensFocalLength = "70mm",
                    shutterSpeed = "1/1250s",
                    aperture = "f/2.8",
                    iso = "ISO 3200",
                    photoRating = 4,
                    notes = "Twirling swift tornado descending into school chimney right at 7:15 PM dusk.",
                    isFavorite = false
                )
            )
            for (s in sampleSightings) {
                birdDao.insertSighting(s)
            }
        }
    }
}

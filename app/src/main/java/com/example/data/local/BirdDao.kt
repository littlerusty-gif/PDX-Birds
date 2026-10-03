package com.example.data.local

import androidx.room.*
import com.example.data.model.BirdSighting
import com.example.data.model.CrowRoostReportEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BirdDao {
    @Query("SELECT * FROM bird_sightings ORDER BY timestamp DESC")
    fun getAllSightings(): Flow<List<BirdSighting>>

    @Query("SELECT * FROM bird_sightings WHERE isFavorite = 1 ORDER BY timestamp DESC")
    fun getFavoriteSightings(): Flow<List<BirdSighting>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSighting(sighting: BirdSighting): Long

    @Update
    suspend fun updateSighting(sighting: BirdSighting)

    @Delete
    suspend fun deleteSighting(sighting: BirdSighting)

    @Query("DELETE FROM bird_sightings WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT COUNT(*) FROM bird_sightings")
    fun getSightingCount(): Flow<Int>

    // Community Crow Roost Reports
    @Query("SELECT * FROM crow_roost_reports ORDER BY timestamp DESC")
    fun getAllRoostReports(): Flow<List<CrowRoostReportEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoostReport(report: CrowRoostReportEntity): Long

    @Delete
    suspend fun deleteRoostReport(report: CrowRoostReportEntity)
}

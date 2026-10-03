package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.BirdSighting
import com.example.ui.theme.GoldenHourGold
import com.example.ui.viewmodel.BirdTrackerViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SightingsJournalScreen(
    viewModel: BirdTrackerViewModel,
    modifier: Modifier = Modifier
) {
    val sightings by viewModel.sightings.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier
                    .padding(bottom = 80.dp)
                    .testTag("add_sighting_fab")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.AddPhotoAlternate, contentDescription = "Log Sighting")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Log Sighting", fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("sightings_journal_column"),
            contentPadding = PaddingValues(bottom = 120.dp)
        ) {
            // Header & Stats
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Field Journal & Sighting Log",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Track your migratory sightings and camera capture metadata",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Stats row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            label = "Total Logs",
                            value = sightings.size.toString(),
                            icon = Icons.Default.FormatListNumbered,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "Favorites",
                            value = sightings.count { it.isFavorite }.toString(),
                            icon = Icons.Default.Favorite,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "5-Star Shots",
                            value = sightings.count { it.photoRating == 5 }.toString(),
                            icon = Icons.Default.Star,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // List of Sightings
            if (sightings.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No sightings logged yet.",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Tap 'Log Sighting' to record your first bird photo!",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                items(sightings, key = { it.id }) { sighting ->
                    SightingCardItem(
                        sighting = sighting,
                        onToggleFavorite = { viewModel.toggleFavorite(sighting) },
                        onDelete = { viewModel.deleteSighting(sighting) }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AddSightingDialog(
            onDismiss = { showAddDialog = false },
            onSave = { newSighting ->
                viewModel.addSighting(newSighting)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun StatCard(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun SightingCardItem(
    sighting: BirdSighting,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .testTag("sighting_item_${sighting.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = sighting.speciesName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "📍 ${sighting.hotspotName} • ${sighting.dateDisplay}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onToggleFavorite) {
                        Icon(
                            imageVector = if (sighting.isFavorite) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (sighting.isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Delete",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Star Rating & Count
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                repeat(5) { index ->
                    Icon(
                        imageVector = if (index < sighting.photoRating) Icons.Default.Star else Icons.Outlined.StarOutline,
                        contentDescription = null,
                        tint = GoldenHourGold,
                        modifier = Modifier.size(16.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Count: ${sighting.count}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // EXIF Camera metadata pill
            if (sighting.cameraGear.isNotBlank() || sighting.shutterSpeed.isNotBlank()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(8.dp)) {
                        if (sighting.cameraGear.isNotBlank()) {
                            Text(
                                text = "📷 ${sighting.cameraGear}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        val exifText = listOf(
                            sighting.lensFocalLength.takeIf { it.isNotBlank() },
                            sighting.shutterSpeed.takeIf { it.isNotBlank() },
                            sighting.aperture.takeIf { it.isNotBlank() },
                            sighting.iso.takeIf { it.isNotBlank() }
                        ).filterNotNull().joinToString(" • ")

                        if (exifText.isNotBlank()) {
                            Text(
                                text = exifText,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            if (sighting.notes.isNotBlank()) {
                Text(
                    text = sighting.notes,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
fun AddSightingDialog(
    onDismiss: () -> Unit,
    onSave: (BirdSighting) -> Unit
) {
    var speciesName by remember { mutableStateOf("") }
    var locationName by remember { mutableStateOf("") }
    var count by remember { mutableStateOf("1") }
    var cameraGear by remember { mutableStateOf("") }
    var focalLength by remember { mutableStateOf("500mm") }
    var shutterSpeed by remember { mutableStateOf("1/2000s") }
    var aperture by remember { mutableStateOf("f/5.6") }
    var iso by remember { mutableStateOf("ISO 400") }
    var rating by remember { mutableStateOf(5) }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    if (speciesName.isNotBlank() && locationName.isNotBlank()) {
                        val dateFormatted = SimpleDateFormat("MMM d", Locale.getDefault()).format(Date())
                        val newSighting = BirdSighting(
                            speciesName = speciesName.trim(),
                            hotspotName = locationName.trim(),
                            dateDisplay = dateFormatted,
                            count = count.toIntOrNull() ?: 1,
                            cameraGear = cameraGear.trim(),
                            lensFocalLength = focalLength.trim(),
                            shutterSpeed = shutterSpeed.trim(),
                            aperture = aperture.trim(),
                            iso = iso.trim(),
                            photoRating = rating,
                            notes = notes.trim(),
                            isFavorite = true
                        )
                        onSave(newSighting)
                    }
                },
                enabled = speciesName.isNotBlank() && locationName.isNotBlank(),
                modifier = Modifier.testTag("save_sighting_button")
            ) {
                Text("Save Sighting")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = {
            Text("Log Oregon Bird Sighting", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = speciesName,
                    onValueChange = { speciesName = it },
                    label = { Text("Species Name (e.g. Tufted Puffin)") },
                    modifier = Modifier.fillMaxWidth().testTag("input_species_name"),
                    singleLine = true
                )

                OutlinedTextField(
                    value = locationName,
                    onValueChange = { locationName = it },
                    label = { Text("Location (e.g. Haystack Rock)") },
                    modifier = Modifier.fillMaxWidth().testTag("input_location_name"),
                    singleLine = true
                )

                OutlinedTextField(
                    value = count,
                    onValueChange = { count = it },
                    label = { Text("Bird Count") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                OutlinedTextField(
                    value = cameraGear,
                    onValueChange = { cameraGear = it },
                    label = { Text("Camera & Lens Gear") },
                    placeholder = { Text("Sony A7IV + 200-600mm") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = shutterSpeed,
                        onValueChange = { shutterSpeed = it },
                        label = { Text("Shutter") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = aperture,
                        onValueChange = { aperture = it },
                        label = { Text("Aperture") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                // Photo Rating Selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Photo Rating:", style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.width(8.dp))
                    repeat(5) { starIndex ->
                        IconButton(onClick = { rating = starIndex + 1 }) {
                            Icon(
                                imageVector = if (starIndex < rating) Icons.Default.Star else Icons.Outlined.StarOutline,
                                contentDescription = "Rate ${starIndex + 1}",
                                tint = GoldenHourGold
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Field Notes & Lighting Observations") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
            }
        }
    )
}

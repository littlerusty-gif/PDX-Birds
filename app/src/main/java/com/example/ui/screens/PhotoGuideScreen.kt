package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Hotspot
import com.example.ui.theme.GoldenHourGold
import com.example.ui.viewmodel.BirdTrackerViewModel

data class CameraPreset(
    val title: String,
    val subject: String,
    val shutterSpeed: String,
    val aperture: String,
    val iso: String,
    val afMode: String,
    val tip: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhotoGuideScreen(
    viewModel: BirdTrackerViewModel,
    modifier: Modifier = Modifier,
    onOpenHotspotDetail: (Hotspot) -> Unit
) {
    var selectedPresetIndex by remember { mutableStateOf(0) }

    val cameraPresets = remember {
        listOf(
            CameraPreset(
                title = "High-Speed Flight",
                subject = "Tufted Puffins, Falcons, Swifts",
                shutterSpeed = "1/2500s – 1/3200s",
                aperture = "f/5.6 – f/6.3",
                iso = "Auto (Max 1600)",
                afMode = "Continuous AF + Subject Tracking (Eye Detect)",
                tip = "Puffins fly 50+ mph; lock focus before they cross the basalt cliff line."
            ),
            CameraPreset(
                title = "Waterfowl & Cranes",
                subject = "Sandhill Cranes, Snow Geese, Swans",
                shutterSpeed = "1/1600s – 1/2000s",
                aperture = "f/6.3 – f/8.0",
                iso = "ISO 200 – 400",
                afMode = "Zone AF or Wide Tracking",
                tip = "Overexpose +0.7 EV against bright water or snow to avoid underexposed bodies."
            ),
            CameraPreset(
                title = "Golden Hour Marsh",
                subject = "Reflections, Silhouettes, Mist",
                shutterSpeed = "1/800s – 1/1250s",
                aperture = "f/4.0 – f/5.6",
                iso = "ISO 400 – 800",
                afMode = "Single Point AF on eye",
                tip = "Get lens as close to the water level as possible for creamy foreground bokeh."
            ),
            CameraPreset(
                title = "Dusk Chimney Vortex",
                subject = "Vaux's Swifts at Chapman School",
                shutterSpeed = "1/1000s – 1/1250s",
                aperture = "f/2.8 (fast prime/zoom)",
                iso = "ISO 3200 – 6400",
                afMode = "Manual Pre-Focus on chimney rim",
                tip = "Don't track individual birds in the dark; burst as the tornado funnels downward."
            )
        )
    }

    // Top ranked spots by photo score
    val topPhotoSpots = remember(viewModel.allHotspots) {
        viewModel.allHotspots.sortedByDescending { it.photoScore }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("photo_guide_scroll_column"),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // Hero Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.35f))
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Camera,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Vantage & Picture Guide",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Oregon's finest vantage angles, golden hour lighting conditions, and flight shutter presets.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Section 1: Field Camera Presets Calculator
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .testTag("camera_presets_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Flight & Lighting Presets",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Tap a scenario to load recommended field settings",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Preset Tabs / Chips
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        cameraPresets.forEachIndexed { index, preset ->
                            val isSelected = selectedPresetIndex == index
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                                contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedPresetIndex = index }
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = preset.title,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Selected Preset Detail Box
                    val activePreset = cameraPresets[selectedPresetIndex]
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surface,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "Target: ${activePreset.subject}",
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            // Settings grid
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                SettingBadge("Shutter", activePreset.shutterSpeed, Icons.Default.Speed)
                                SettingBadge("Aperture", activePreset.aperture, Icons.Default.Lens)
                                SettingBadge("ISO", activePreset.iso, Icons.Default.WbSunny)
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(verticalAlignment = Alignment.Top) {
                                Icon(
                                    imageVector = Icons.Default.Lightbulb,
                                    contentDescription = null,
                                    tint = GoldenHourGold,
                                    modifier = Modifier
                                        .size(16.dp)
                                        .padding(top = 2.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = activePreset.tip,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section 2: Golden Hour & Lighting Guide for Oregon
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.WbTwilight,
                            contentDescription = null,
                            tint = GoldenHourGold,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Oregon Lighting & Sun Angles",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))

                    LightingItem(
                        title = "Eastern Oregon (Malheur Basin)",
                        angle = "Sunrise Backlight + Steens Reflection",
                        description = "Arrive 30 mins before sunrise at the Refuge Display Pond. The low sun rises behind Steens Mountain, providing rim lighting on crane wings and warm marsh reflections."
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LightingItem(
                        title = "Oregon Coast (Cannon Beach & Yaquina)",
                        angle = "Late Afternoon Front Light (4 - 7 PM)",
                        description = "Because Oregon faces west to the Pacific, morning light backlights offshore sea stacks. Shoot puffins and murres in late afternoon when the sun directly illuminates their colorful face plumage."
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LightingItem(
                        title = "Willamette Valley (Sauvie & Tualatin)",
                        angle = "Diffused Morning Fog (8 - 11 AM)",
                        description = "Valley winter fog acts as a giant natural softbox! Eliminates harsh feather shadows on snowy geese and allows balanced exposures of white and dark raptors."
                    )
                }
            }
        }

        // Section 3: Ranked Top Photography Spots Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, top = 20.dp, bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Ranked Vantage Points for Best Shots",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Pro Rated",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // Top Spots List
        items(topPhotoSpots, key = { it.id }) { spot ->
            VantageSpotCard(
                hotspot = spot,
                onCardClick = { onOpenHotspotDetail(spot) },
                onAskAiClick = { viewModel.askAboutHotspot(spot) }
            )
        }
    }
}

@Composable
fun SettingBadge(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(13.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
fun LightingItem(title: String, angle: String, description: String) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = angle,
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
                color = GoldenHourGold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun VantageSpotCard(
    hotspot: Hotspot,
    onCardClick: () -> Unit,
    onAskAiClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable(onClick = onCardClick)
            .testTag("vantage_card_${hotspot.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = hotspot.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Text(
                        text = "⭐ ${hotspot.photoScore}",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Vantage point
            Text(
                text = "📍 Vantage: ${hotspot.photoVantagePoint}",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Lens and settings
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.CameraAlt,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = hotspot.recommendedLens,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Tune,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = hotspot.recommendedSettings,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = hotspot.lightingDirection,
                    style = MaterialTheme.typography.labelSmall,
                    color = GoldenHourGold,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onAskAiClick) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = "Ask AI",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

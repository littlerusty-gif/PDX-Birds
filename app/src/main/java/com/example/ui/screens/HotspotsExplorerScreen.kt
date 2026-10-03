package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.model.EBirdHotspot
import com.example.data.model.EBirdObservation
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.PdxBirdViewModel

@Composable
fun HotspotsExplorerScreen(
    viewModel: PdxBirdViewModel,
    modifier: Modifier = Modifier
) {
    val hotspots by viewModel.hotspots.collectAsState()
    val rawObservations by viewModel.rawObservations.collectAsState()
    var selectedHotspot by remember { mutableStateOf<EBirdHotspot?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .testTag("hotspots_explorer_screen")
    ) {
        // Header
        Surface(
            color = Slate900,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Place,
                        contentDescription = null,
                        tint = Emerald500,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Portland eBird Hotspots",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Official eBird geo-hotspots across Multnomah & surrounding counties. Tap to inspect recent species activity.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(hotspots, key = { it.locId }) { hotspot ->
                HotspotListItem(
                    hotspot = hotspot,
                    onClick = { selectedHotspot = hotspot },
                    onExploreOnMap = {
                        val mockObs = EBirdObservation(
                            speciesCode = "amecro",
                            comName = hotspot.locName,
                            sciName = "eBird Hotspot",
                            locId = hotspot.locId,
                            locName = hotspot.locName,
                            obsDt = "Active Spot",
                            lat = hotspot.lat,
                            lng = hotspot.lng
                        )
                        viewModel.selectObservation(mockObs)
                        viewModel.setActiveTab(MainTab.MAP_FEED)
                    }
                )
            }
        }
    }

    // Hotspot Species Details Dialog
    selectedHotspot?.let { spot ->
        val matchingObservations = rawObservations.filter {
            it.locId == spot.locId || it.locName.contains(spot.locName.take(12), ignoreCase = true)
        }

        AlertDialog(
            onDismissRequest = { selectedHotspot = null },
            confirmButton = {
                Button(
                    onClick = {
                        val mockObs = EBirdObservation(
                            speciesCode = "amecro",
                            comName = spot.locName,
                            sciName = "eBird Hotspot",
                            locId = spot.locId,
                            locName = spot.locName,
                            obsDt = "Active Spot",
                            lat = spot.lat,
                            lng = spot.lng
                        )
                        viewModel.selectObservation(mockObs)
                        viewModel.setActiveTab(MainTab.MAP_FEED)
                        selectedHotspot = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black)
                ) {
                    Text("View Hotspot on Live Map")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedHotspot = null }) {
                    Text("Close", color = Slate400)
                }
            },
            title = {
                Text(spot.locName, fontWeight = FontWeight.Bold, color = Slate100)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Hotspot Code: ${spot.locId} • ${spot.lat.toString().take(7)}, ${spot.lng.toString().take(8)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Divider(color = Slate700)
                    Text(
                        text = "Recently Reported Species (${matchingObservations.size}):",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = Emerald400
                    )
                    if (matchingObservations.isEmpty()) {
                        Text(
                            text = "General high-traffic hotspot. Over ${spot.numSpeciesAllTime} cumulative species recorded here on eBird.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate300
                        )
                    } else {
                        matchingObservations.forEach { obs ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(obs.comName, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium, color = Slate100)
                                Text("${obs.howMany} birds", style = MaterialTheme.typography.labelSmall, color = Emerald400)
                            }
                        }
                    }
                }
            },
            containerColor = Slate900,
            textContentColor = Slate200
        )
    }
}

@Composable
fun HotspotListItem(
    hotspot: EBirdHotspot,
    onClick: () -> Unit,
    onExploreOnMap: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("hotspot_card_${hotspot.locId}")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = hotspot.locName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
                Text(
                    text = "Code: ${hotspot.locId} • GPS: ${hotspot.lat.toString().take(6)}, ${hotspot.lng.toString().take(7)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Slate800
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.MenuBook, contentDescription = null, tint = Emerald400, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${hotspot.numSpeciesAllTime} spp",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Emerald400
                    )
                }
            }
        }
    }
}

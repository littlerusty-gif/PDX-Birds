package com.example.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportRoostModal(
    onDismiss: () -> Unit,
    onSubmit: (count: Int, location: String, direction: String, behavior: String, notes: String) -> Unit
) {
    var countText by remember { mutableStateOf("500") }
    var locationName by remember { mutableStateOf("") }
    var selectedDirection by remember { mutableStateOf("SW toward Downtown") }
    var selectedBehavior by remember { mutableStateOf("Staging on Rooftops/Trees") }
    var notes by remember { mutableStateOf("") }

    val directions = listOf(
        "SW toward Downtown",
        "West across Willamette",
        "East toward Eastside Staging",
        "Circling Roost Canopy",
        "Settled Roosting",
        "Northbound River Corridor",
        "Southbound Corridor"
    )

    val behaviors = listOf(
        "Mega-Roost (500+ birds)",
        "Staging on Rooftops/Trees",
        "High Flight Stream",
        "Pre-Dusk Ground Foraging"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    val count = countText.toIntOrNull() ?: 100
                    if (locationName.isNotBlank()) {
                        onSubmit(count, locationName.trim(), selectedDirection, selectedBehavior, notes.trim())
                    }
                },
                enabled = locationName.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.testTag("submit_roost_report_btn")
            ) {
                Text("Post Roost Observation", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Slate400)
            }
        },
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Community Roost Spotter", fontWeight = FontWeight.Bold, color = Slate100)
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate400)
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    "Log flock counts, staging trees, and flight transit vectors heading into downtown Portland.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )

                OutlinedTextField(
                    value = locationName,
                    onValueChange = { locationName = it },
                    label = { Text("Location Name", color = Slate300) },
                    placeholder = { Text("e.g. South Park Blocks, Lloyd Center, Morrison Bridge") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate200,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("input_roost_location"),
                    singleLine = true
                )

                OutlinedTextField(
                    value = countText,
                    onValueChange = { countText = it },
                    label = { Text("Estimated Flock Count", color = Slate300) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate200,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("input_roost_count"),
                    singleLine = true
                )

                // Flight Direction Selector
                Text("Flight Transit Direction:", style = MaterialTheme.typography.labelMedium, color = Slate200)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    directions.take(4).forEach { dir ->
                        val isSel = selectedDirection == dir
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSel) Emerald900 else Slate800,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) Emerald500 else Slate700),
                            onClick = { selectedDirection = dir },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "🧭 $dir",
                                style = MaterialTheme.typography.bodySmall,
                                color = if (isSel) Emerald400 else Slate300,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }

                // Staging Behavior
                Text("Roost Behavior:", style = MaterialTheme.typography.labelMedium, color = Slate200)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    behaviors.forEach { beh ->
                        val isSel = selectedBehavior == beh
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSel) Color(0xFF451A03) else Slate800,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) FlockOrange else Slate700),
                            onClick = { selectedBehavior = beh },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "• $beh",
                                style = MaterialTheme.typography.bodySmall,
                                color = if (isSel) FlockOrange else Slate300,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Field Notes & Tree Canopy Details", color = Slate300) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate200,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
            }
        },
        containerColor = Slate900,
        textContentColor = Slate200
    )
}

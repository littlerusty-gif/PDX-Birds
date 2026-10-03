package com.example.ui.screens

import androidx.compose.foundation.background
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
import com.example.data.model.CrowRoostReportEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.PdxBirdViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CrowRoostTrackerScreen(
    viewModel: PdxBirdViewModel,
    modifier: Modifier = Modifier
) {
    val communityReports by viewModel.communityRoostReports.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .testTag("crow_roost_tracker_screen")
    ) {
        // Header
        Surface(
            color = Slate900,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(FlockCrimson),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Navigation, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Portland Crow Roost Vectors",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate100
                        )
                    }

                    Button(
                        onClick = { viewModel.showReportModal = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.testTag("report_sighting_header_btn")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Log Roost")
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Track the 15,000+ American Crows congregating each winter evening across South Park Blocks, Waterfront Park, and Willamette River bridge flight streams.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Known Mega-Roost Zones Overview
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    border = androidx.compose.foundation.BorderStroke(1.dp, FlockCrimson.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = FlockCrimson, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Downtown Winter Mega-Roost Corridors",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = Slate100
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))

                        RoostZoneItem("1. South Park Blocks (SW Park & Salmon)", "7,500 – 10,000 crows in historic Dutch elms. Pre-roost staging 5:00 PM; dense settling by 6:15 PM.")
                        RoostZoneItem("2. Tom McCall Waterfront Park", "Up to 12,000 crows arriving via the Hawthorne & Morrison bridge river corridors.")
                        RoostZoneItem("3. Lloyd Center / NE Eastside Fly-in", "East Portland staging flocks assembling on rooftops and Douglas firs before crossing west.")
                    }
                }
            }

            // Community Logged Vectors List
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Community Spotter Feed (${communityReports.size})",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = Emerald400
                    )
                    Text(
                        text = "Real-time Field Birders",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                }
            }

            if (communityReports.isEmpty()) {
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Slate900,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.FlightTakeoff, contentDescription = null, tint = Slate400, modifier = Modifier.size(36.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("No community spotter reports logged yet today.", style = MaterialTheme.typography.bodySmall, color = Slate400)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Tap 'Log Roost' to report flock counts and flight angles!", style = MaterialTheme.typography.labelSmall, color = Emerald400)
                        }
                    }
                }
            } else {
                items(communityReports, key = { it.id }) { report ->
                    RoostReportItem(report = report)
                }
            }
        }
    }
}

@Composable
fun RoostZoneItem(title: String, desc: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(title, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold, color = Slate200)
        Text(desc, style = MaterialTheme.typography.labelSmall, color = Slate400)
    }
}

@Composable
fun RoostReportItem(report: CrowRoostReportEntity) {
    val dateStr = remember(report.timestamp) {
        SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(report.timestamp))
    }

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        modifier = Modifier.fillMaxWidth().testTag("community_report_${report.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(if (report.count > 500) FlockCrimson else FlockOrange),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (report.count > 999) "${report.count/1000}k" else report.count.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(report.locationName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = Slate100)
                        Text(report.behavior, style = MaterialTheme.typography.labelSmall, color = Emerald400)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFF0284C7).copy(alpha = 0.25f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(report.flightDirection, style = MaterialTheme.typography.labelSmall, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                    }
                }
            }

            if (report.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(report.notes, style = MaterialTheme.typography.bodySmall, color = Slate300)
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text("Logged: $dateStr • Confirmed Community Record", style = MaterialTheme.typography.labelSmall, color = Slate400)
        }
    }
}

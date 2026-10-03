package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.EBirdObservation
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.PdxBirdViewModel

@Composable
fun NotableSightingsScreen(
    viewModel: PdxBirdViewModel,
    modifier: Modifier = Modifier
) {
    val notableList by viewModel.notableObservations.collectAsState()
    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .testTag("notable_sightings_screen")
    ) {
        // Frosted Glass Alert Header
        Surface(
            color = Slate900,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.NotificationImportant,
                        contentDescription = null,
                        tint = Color(0xFFEC4899),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Multnomah County Rare Sightings",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Real-time feed from eBird 2.0 notable query (US-OR-051). Uncommon, vagrant, or high-count records.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .testTag("notable_sightings_list"),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(notableList, key = { it.id }) { obs ->
                NotableCardItem(
                    obs = obs,
                    onViewOnMap = {
                        viewModel.selectObservation(obs)
                        viewModel.setActiveTab(MainTab.MAP_FEED)
                    },
                    onOpenChecklist = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(obs.checklistUrl))
                        context.startActivity(intent)
                    }
                )
            }
        }
    }
}

@Composable
fun NotableCardItem(
    obs: EBirdObservation,
    onViewOnMap: () -> Unit,
    onOpenChecklist: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFEC4899).copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth().testTag("notable_card_${obs.speciesCode}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Species & Alert Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = obs.comName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    Text(
                        text = obs.sciName,
                        style = MaterialTheme.typography.bodySmall,
                        fontStyle = FontStyle.Italic,
                        color = Slate400
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF831843)
                ) {
                    Text(
                        text = "RARE ALERT",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFBCFE8),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Location & Date Info
            Text(
                text = "📍 ${obs.locName}",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
                color = Slate200
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Count: ${obs.howMany} bird(s)",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = Emerald400
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Observed: ${obs.obsDt}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400
                )
            }

            // Observer Notes
            if (!obs.notes.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate800,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = obs.notes,
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate300,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onViewOnMap,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Explore, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("View on Dark Matter Map")
                }

                OutlinedButton(
                    onClick = onOpenChecklist,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Slate300),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("eBird Checklist ↗")
                }
            }
        }
    }
}

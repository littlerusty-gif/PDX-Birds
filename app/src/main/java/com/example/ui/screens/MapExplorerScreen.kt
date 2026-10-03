package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import com.example.data.model.EBirdObservation
import com.example.data.model.QuickCategory
import com.example.data.model.TaxonomyItem
import com.example.ui.components.DarkMatterCanvasMap
import com.example.ui.components.LeafletMapView
import com.example.ui.theme.*
import com.example.ui.viewmodel.PdxBirdViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapExplorerScreen(
    viewModel: PdxBirdViewModel,
    modifier: Modifier = Modifier
) {
    val observations by viewModel.filteredObservations.collectAsState()
    val selectedObservation by viewModel.selectedObservation.collectAsState()
    val activeCategory by viewModel.activeCategory.collectAsState()
    val isSidebarExpanded by viewModel.isSidebarExpanded.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val taxonomySuggestions by viewModel.taxonomySuggestions.collectAsState()
    val selectedSpeciesCode by viewModel.selectedSpeciesCode.collectAsState()
    val radiusKm by viewModel.radiusKm.collectAsState()
    val timeframeDays by viewModel.timeframeDays.collectAsState()
    val hotspotsOnly by viewModel.hotspotsOnly.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()

    var showFiltersPanel by remember { mutableStateOf(false) }
    var useVectorMap by remember { mutableStateOf(true) }

    Box(modifier = modifier.fillMaxSize().background(Slate950)) {
        // Map: Native Dark Matter Canvas Map or Leaflet Webview
        if (useVectorMap) {
            DarkMatterCanvasMap(
                observations = observations,
                selectedObservation = selectedObservation,
                modifier = Modifier.fillMaxSize(),
                onObservationClicked = { obs: EBirdObservation ->
                    viewModel.selectObservation(obs)
                }
            )
        } else {
            LeafletMapView(
                observations = observations,
                selectedObservation = selectedObservation,
                modifier = Modifier.fillMaxSize(),
                onObservationClicked = { obs: EBirdObservation ->
                    viewModel.selectObservation(obs)
                }
            )
        }

        // 2. Floating Top Frosted Glass Search & Category Bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
                .align(Alignment.TopCenter)
        ) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Slate900.copy(alpha = 0.94f),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate700),
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    // Search bar with Autocomplete Taxonomy
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Emerald500,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        TextField(
                            value = searchQuery,
                            onValueChange = { viewModel.setSearchQuery(it) },
                            placeholder = {
                                Text(
                                    "Search species (e.g. American Crow, Swift, Falcon)...",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Slate400
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = Slate100,
                                unfocusedTextColor = Slate200
                            ),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("species_autocomplete_input")
                        )

                        if (searchQuery.isNotEmpty() || selectedSpeciesCode != null) {
                            IconButton(
                                onClick = { viewModel.clearSpeciesSearch() },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear", tint = Slate400)
                            }
                        }

                        // Map Mode (Vector Canvas vs Leaflet Tiles) toggle button
                        IconButton(
                            onClick = { useVectorMap = !useVectorMap },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (useVectorMap) Color(0xFF064E3B) else Slate800)
                                .testTag("toggle_map_engine_button"),
                            content = {
                                Icon(
                                    imageVector = if (useVectorMap) Icons.Default.Layers else Icons.Default.Public,
                                    contentDescription = if (useVectorMap) "Switch to Leaflet Tiles" else "Switch to Vector Radar",
                                    tint = if (useVectorMap) Emerald400 else Slate300,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        // Filter settings toggle button
                        IconButton(
                            onClick = { showFiltersPanel = !showFiltersPanel },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (showFiltersPanel) Emerald500.copy(alpha = 0.2f) else Slate800)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = "Filters",
                                tint = if (showFiltersPanel) Emerald400 else Slate300
                            )
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        // Sidebar / Feed Drawer Toggle Button
                        IconButton(
                            onClick = { viewModel.toggleSidebar() },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSidebarExpanded) Emerald500.copy(alpha = 0.2f) else Slate800)
                                .testTag("toggle_sidebar_feed_button")
                        ) {
                            Icon(
                                imageVector = if (isSidebarExpanded) Icons.Default.ViewSidebar else Icons.Outlined.ViewSidebar,
                                contentDescription = "Toggle Feed",
                                tint = if (isSidebarExpanded) Emerald400 else Slate300
                            )
                        }
                    }

                    // Autocomplete Dropdown suggestions list
                    if (taxonomySuggestions.isNotEmpty()) {
                        Divider(color = Slate700, modifier = Modifier.padding(vertical = 4.dp))
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 180.dp)
                        ) {
                            taxonomySuggestions.take(4).forEach { item ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable { viewModel.selectSpecies(item) }
                                        .padding(horizontal = 8.dp, vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(item.comName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = Slate100)
                                        Text("${item.sciName} • code: ${item.speciesCode}", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                    }
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = Emerald900
                                    ) {
                                        Text(item.familyComName, style = MaterialTheme.typography.labelSmall, color = Emerald400, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                    }
                                }
                            }
                        }
                    }

                    // Quick Category Pills
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        QuickCategory.values().forEach { cat ->
                            val isSelected = activeCategory == cat
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectCategory(cat) },
                                label = {
                                    Text(
                                        cat.label,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                leadingIcon = if (isSelected) {
                                    { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp)) }
                                } else null,
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(cat.badgeColorHex).copy(alpha = 0.25f),
                                    selectedLabelColor = Color(cat.badgeColorHex),
                                    containerColor = Slate800,
                                    labelColor = Slate300
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isSelected,
                                    borderColor = if (isSelected) Color(cat.badgeColorHex) else Slate700
                                )
                            )
                        }
                    }

                    // Expandable Filter Controls Panel
                    AnimatedVisibility(
                        visible = showFiltersPanel,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 10.dp)
                        ) {
                            Divider(color = Slate700)
                            Spacer(modifier = Modifier.height(8.dp))

                            // Radius Slider (5km to 50km)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Search Radius: ${radiusKm}km", style = MaterialTheme.typography.labelMedium, color = Slate300)
                                Text("Multnomah & Portland Area", style = MaterialTheme.typography.labelSmall, color = Slate400)
                            }
                            Slider(
                                value = radiusKm.toFloat(),
                                onValueChange = { viewModel.setRadius(it.toInt()) },
                                valueRange = 5f..50f,
                                steps = 9,
                                colors = SliderDefaults.colors(
                                    thumbColor = Emerald500,
                                    activeTrackColor = Emerald500,
                                    inactiveTrackColor = Slate700
                                )
                            )

                            // Observation Timeframe & Hotspots Only Toggle
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Timeframe", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        listOf(1 to "24h", 3 to "3d", 7 to "7d", 14 to "14d").forEach { (days, label) ->
                                            val isSel = timeframeDays == days
                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = if (isSel) Emerald500 else Slate800,
                                                modifier = Modifier.clickable { viewModel.setTimeframe(days) }
                                            ) {
                                                Text(
                                                    text = label,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = if (isSel) Color.Black else Slate300,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                                )
                                            }
                                        }
                                    }
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("Hotspots Only", style = MaterialTheme.typography.labelSmall, color = Slate300)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Switch(
                                        checked = hotspotsOnly,
                                        onCheckedChange = { viewModel.toggleHotspotsOnly(it) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Floating Bottom/Sidebar Collapsible Observation Feed (Split View)
        AnimatedVisibility(
            visible = isSidebarExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically(),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .heightIn(max = 280.dp)
                .padding(12.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = Slate900.copy(alpha = 0.95f),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate700),
                shadowElevation = 12.dp,
                modifier = Modifier.fillMaxSize()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    // Feed Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (isLoading) FlockAmber else Emerald500)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "PDX Observation Feed (${observations.size})",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = Slate100
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TextButton(
                                onClick = { viewModel.findNearMe() },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(14.dp), tint = Emerald400)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Near Me", style = MaterialTheme.typography.labelSmall, color = Emerald400)
                            }

                            IconButton(
                                onClick = { viewModel.setSidebarExpanded(false) },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Close feed", tint = Slate400, modifier = Modifier.size(16.dp))
                            }
                        }
                    }

                    Divider(color = Slate700, modifier = Modifier.padding(vertical = 6.dp))

                    // Feed List
                    if (observations.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (isLoading) "Querying eBird API 2.0..." else "No observations matching active filters.",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate400
                            )
                        }
                    } else {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.testTag("map_sidebar_observation_feed")
                        ) {
                            items(observations, key = { it.id }) { obs ->
                                ObservationFeedItem(
                                    obs = obs,
                                    isSelected = selectedObservation?.id == obs.id,
                                    onClick = { viewModel.selectObservation(obs) }
                                )
                            }
                        }
                    }
                }
            }
        }

        // 4. Floating Action Buttons (Report Sighting & Recenter)
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 16.dp, bottom = if (isSidebarExpanded) 300.dp else 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Report Roost / Sighting FAB
            FloatingActionButton(
                onClick = { viewModel.showReportModal = true },
                containerColor = Emerald500,
                contentColor = Color.Black,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.testTag("report_roost_fab")
            ) {
                Row(modifier = Modifier.padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AddLocationAlt, contentDescription = "Report Sighting")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Report Roost", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                }
            }

            // Quick Re-center "Find Near Me" FAB
            SmallFloatingActionButton(
                onClick = { viewModel.findNearMe() },
                containerColor = Slate800,
                contentColor = Emerald400,
                modifier = Modifier.align(Alignment.End).testTag("find_near_me_fab")
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = "Find Near Me")
            }
        }
    }
}

@Composable
fun ObservationFeedItem(
    obs: EBirdObservation,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) Slate700 else Slate800,
        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, Emerald500) else null,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("feed_item_${obs.id}")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Count badge indicator
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(obs.flockColor),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (obs.howMany > 999) "${obs.howMany / 1000}k" else obs.howMany.toString(),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (obs.howMany > 500) Color.White else Color.Black
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = obs.comName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    if (obs.isCrowRoost) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = FlockCrimson.copy(alpha = 0.2f)
                        ) {
                            Text(
                                "MEGA-ROOST",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = FlockCrimson,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                            )
                        }
                    }
                }

                Text(
                    text = "📍 ${obs.locName}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate300,
                    maxLines = 1
                )

                if (obs.direction != null) {
                    Text(
                        text = "🧭 Transit: ${obs.direction}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF38BDF8),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.width(6.dp))

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = obs.obsDt.takeLast(5),
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate400
                )
                if (obs.obsReviewed) {
                    Text("✓ Confirmed", style = MaterialTheme.typography.labelSmall, color = Emerald400)
                }
            }
        }
    }
}

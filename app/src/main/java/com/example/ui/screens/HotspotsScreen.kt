package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Hotspot
import com.example.data.model.OregonRegion
import com.example.ui.theme.Evergreen40
import com.example.ui.theme.GoldenHourGold
import com.example.ui.viewmodel.BirdTrackerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HotspotsScreen(
    viewModel: BirdTrackerViewModel,
    modifier: Modifier = Modifier,
    onOpenHotspotDetail: (Hotspot) -> Unit
) {
    val selectedRegion by viewModel.selectedRegion.collectAsState()
    var showMapRadar by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }

    val filteredHotspots = remember(viewModel.allHotspots, selectedRegion, searchQuery) {
        viewModel.allHotspots.filter { hotspot ->
            val matchesRegion = selectedRegion == null || hotspot.region == selectedRegion
            val matchesSearch = searchQuery.isBlank() ||
                    hotspot.name.contains(searchQuery, ignoreCase = true) ||
                    hotspot.primarySpecies.any { it.contains(searchQuery, ignoreCase = true) } ||
                    hotspot.habitatType.contains(searchQuery, ignoreCase = true)
            matchesRegion && matchesSearch
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("hotspots_list_column"),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // Hero Header & Search
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Oregon Flyway Hotspots",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Pacific Flyway Corridor • ${filteredHotspots.size} verified locations",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(
                        onClick = { showMapRadar = !showMapRadar },
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .testTag("toggle_map_view_button")
                    ) {
                        Icon(
                            imageVector = if (showMapRadar) Icons.Default.Layers else Icons.Outlined.Map,
                            contentDescription = "Toggle Map Visualization"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Search field
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("hotspot_search_input"),
                    placeholder = { Text("Search by refuge, species, or habitat...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear search")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Region Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedRegion == null,
                        onClick = { viewModel.selectRegion(null) },
                        label = { Text("All Oregon") },
                        leadingIcon = if (selectedRegion == null) {
                            { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                        } else null
                    )
                    OregonRegion.values().forEach { region ->
                        FilterChip(
                            selected = selectedRegion == region,
                            onClick = {
                                viewModel.selectRegion(if (selectedRegion == region) null else region)
                            },
                            label = { Text(region.displayName) },
                            leadingIcon = if (selectedRegion == region) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                            } else null
                        )
                    }
                }
            }
        }

        // Interactive Oregon Flyway Map / Radar Canvas
        if (showMapRadar) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .testTag("oregon_radar_map_card"),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Explore,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Flyway Radar & Migration Vantage Points",
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = "Tap pin to view",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Oregon Canvas
                        OregonMapCanvas(
                            hotspots = filteredHotspots,
                            onHotspotClicked = onOpenHotspotDetail
                        )
                    }
                }
            }
        }

        // Section Title
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Refuges & Coastal Vantage Sites",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${filteredHotspots.size} spots",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Hotspot Cards List
        items(filteredHotspots, key = { it.id }) { hotspot ->
            HotspotCardItem(
                hotspot = hotspot,
                onCardClick = { onOpenHotspotDetail(hotspot) },
                onAskAiClick = { viewModel.askAboutHotspot(hotspot) }
            )
        }
    }
}

@Composable
fun OregonMapCanvas(
    hotspots: List<Hotspot>,
    onHotspotClicked: (Hotspot) -> Unit
) {
    // Oregon bounding box roughly: Lat 42.0 to 46.3, Lon -124.5 to -116.5
    val minLat = 41.8
    val maxLat = 46.5
    val minLon = -124.8
    val maxLon = -116.3

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(210.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF0F261E))
            .pointerInput(hotspots) {
                detectTapGestures { tapOffset ->
                    val w = size.width.toFloat()
                    val h = size.height.toFloat()

                    var closestHotspot: Hotspot? = null
                    var closestDist = Float.MAX_VALUE

                    for (spot in hotspots) {
                        val normX = ((spot.longitude - minLon) / (maxLon - minLon)).toFloat()
                        val normY = (1.0f - ((spot.latitude - minLat) / (maxLat - minLat)).toFloat())

                        val px = normX * w
                        val py = normY * h

                        val dx = px - tapOffset.x
                        val dy = py - tapOffset.y
                        val dist = kotlin.math.sqrt(dx * dx + dy * dy)
                        if (dist < 40f && dist < closestDist) {
                            closestDist = dist
                            closestHotspot = spot
                        }
                    }

                    closestHotspot?.let { onHotspotClicked(it) }
                }
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // 1. Draw stylized Oregon state outline
            val statePath = Path().apply {
                // Pacific Coast line
                val p1 = Offset(0.04f * w, 0.08f * h) // NW corner Columbia mouth
                val p2 = Offset(0.02f * w, 0.50f * h) // mid coast
                val p3 = Offset(0.01f * w, 0.95f * h) // SW corner near Brookings
                val p4 = Offset(0.92f * w, 0.95f * h) // SE corner near McDermitt
                val p5 = Offset(0.92f * w, 0.22f * h) // NE corner near Snake River Hells Canyon
                val p6 = Offset(0.55f * w, 0.12f * h) // Columbia bend
                val p7 = Offset(0.25f * w, 0.10f * h) // Gorge

                moveTo(p1.x, p1.y)
                lineTo(p2.x, p2.y)
                lineTo(p3.x, p3.y)
                lineTo(p4.x, p4.y)
                lineTo(p5.x, p5.y)
                lineTo(p6.x, p6.y)
                lineTo(p7.x, p7.y)
                close()
            }

            drawPath(
                path = statePath,
                color = Color(0xFF1B4D3E).copy(alpha = 0.45f)
            )
            drawPath(
                path = statePath,
                color = Color(0xFF74DAB8).copy(alpha = 0.5f),
                style = Stroke(width = 2.dp.toPx())
            )

            // 2. Columbia River & Willamette River guides
            drawLine(
                color = Color(0xFF4FC3F7).copy(alpha = 0.5f),
                start = Offset(0.04f * w, 0.08f * h),
                end = Offset(0.55f * w, 0.12f * h),
                strokeWidth = 2.dp.toPx()
            )

            // Cascade mountain ridge line (dashed feel)
            val cascadeX = 0.32f * w
            drawLine(
                color = Color(0xFF81C784).copy(alpha = 0.3f),
                start = Offset(cascadeX, 0.10f * h),
                end = Offset(cascadeX - 0.02f * w, 0.95f * h),
                strokeWidth = 1.5.dp.toPx()
            )

            // 3. Draw flyway migratory corridor arrows
            drawLine(
                color = Color(0xFFFFD54F).copy(alpha = 0.4f),
                start = Offset(0.20f * w, 0.05f * h),
                end = Offset(0.28f * w, 0.90f * h),
                strokeWidth = 1.dp.toPx()
            )
            drawLine(
                color = Color(0xFFFFD54F).copy(alpha = 0.4f),
                start = Offset(0.70f * w, 0.15f * h),
                end = Offset(0.65f * w, 0.85f * h),
                strokeWidth = 1.dp.toPx()
            )

            // 4. Draw Hotspot pins
            for (spot in hotspots) {
                val normX = ((spot.longitude - minLon) / (maxLon - minLon)).toFloat().coerceIn(0.02f, 0.98f)
                val normY = (1.0f - ((spot.latitude - minLat) / (maxLat - minLat)).toFloat()).coerceIn(0.02f, 0.98f)

                val center = Offset(normX * w, normY * h)

                // Outer radar glow
                drawCircle(
                    color = Color(0xFFFFD54F).copy(alpha = 0.25f),
                    radius = 12.dp.toPx(),
                    center = center
                )

                // Inner pin body
                drawCircle(
                    color = Color(0xFFFFB300),
                    radius = 6.dp.toPx(),
                    center = center
                )
                drawCircle(
                    color = Color.White,
                    radius = 2.5.dp.toPx(),
                    center = center
                )
            }
        }

        // Overlay Map Legend / Watermark
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(8.dp)
                .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(6.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFB300))
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Pacific Flyway Corridor • Oregon",
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(alpha = 0.9f)
            )
        }
    }
}

@Composable
fun HotspotCardItem(
    hotspot: Hotspot,
    onCardClick: () -> Unit,
    onAskAiClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable(onClick = onCardClick)
            .testTag("hotspot_item_${hotspot.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Name & Region Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = hotspot.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${hotspot.region.displayName} • ${hotspot.habitatType}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Photo rating pill
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier.padding(start = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = GoldenHourGold,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = String.format("%.1f", hotspot.photoScore),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Photography Highlight: Best Time & Vantage
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Best Vantage: ${hotspot.photoVantagePoint}",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.WbTwilight,
                            contentDescription = null,
                            tint = GoldenHourGold,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = hotspot.bestPhotoTime,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Species tags
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (hotspot.blindAvailable) {
                    SuggestionChip(
                        onClick = onCardClick,
                        label = { Text("Photo Blind Available", style = MaterialTheme.typography.labelSmall) },
                        icon = { Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp)) },
                        colors = SuggestionChipDefaults.suggestionChipColors(
                            containerColor = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.6f)
                        )
                    )
                }

                hotspot.primarySpecies.take(3).forEach { bird ->
                    SuggestionChip(
                        onClick = onCardClick,
                        label = { Text(bird, style = MaterialTheme.typography.labelSmall) }
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
                TextButton(
                    onClick = onCardClick,
                    modifier = Modifier.testTag("hotspot_view_details_${hotspot.id}")
                ) {
                    Text("View Lens & Vantage Guide")
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                }

                OutlinedButton(
                    onClick = onAskAiClick,
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("hotspot_ask_ai_${hotspot.id}")
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Ask AI", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

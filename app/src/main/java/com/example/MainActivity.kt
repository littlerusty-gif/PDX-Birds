package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import com.example.ui.components.ApiKeySettingsModal
import com.example.ui.components.ReportRoostModal
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.PdxBirdViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: PdxBirdViewModel by viewModels()

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PDXBirdTrackTheme {
                val activeTab by viewModel.activeTab.collectAsState()
                val notableCount by viewModel.notableObservations.collectAsState()

                BackHandler(enabled = activeTab != MainTab.MAP_FEED) {
                    viewModel.setActiveTab(MainTab.MAP_FEED)
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize().background(Slate950),
                    topBar = {
                        TopAppBar(
                            title = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(Emerald500),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.FilterHdr,
                                            contentDescription = null,
                                            tint = Color.Black,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = "PDX Bird & Crow Tracker",
                                            fontWeight = FontWeight.Bold,
                                            style = MaterialTheme.typography.titleMedium,
                                            color = Slate100
                                        )
                                        Text(
                                            text = "eBird 2.0 • Multnomah & Pacific Flyway",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = Emerald400
                                        )
                                    }
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = Slate900,
                                titleContentColor = Slate100
                            ),
                            actions = {
                                // Refresh observations
                                IconButton(onClick = { viewModel.loadObservations() }) {
                                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Slate300)
                                }

                                // eBird API Key Configuration
                                IconButton(onClick = { viewModel.showApiKeyModal = true }) {
                                    Icon(Icons.Default.VpnKey, contentDescription = "eBird API Token", tint = Emerald400)
                                }
                            }
                        )
                    },
                    bottomBar = {
                        NavigationBar(
                            containerColor = Slate900,
                            tonalElevation = 8.dp,
                            modifier = Modifier.testTag("pdx_bottom_nav_bar")
                        ) {
                            NavigationBarItem(
                                selected = activeTab == MainTab.MAP_FEED,
                                onClick = { viewModel.setActiveTab(MainTab.MAP_FEED) },
                                icon = {
                                    Icon(
                                        imageVector = if (activeTab == MainTab.MAP_FEED) Icons.Default.Map else Icons.Outlined.Map,
                                        contentDescription = "Live Map"
                                    )
                                },
                                label = { Text("Dark Map") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Emerald400,
                                    indicatorColor = Emerald500,
                                    unselectedIconColor = Slate400,
                                    unselectedTextColor = Slate400
                                ),
                                modifier = Modifier.testTag("nav_tab_map")
                            )

                            NavigationBarItem(
                                selected = activeTab == MainTab.CROW_ROOSTS,
                                onClick = { viewModel.setActiveTab(MainTab.CROW_ROOSTS) },
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            Badge(containerColor = FlockCrimson) {
                                                Text("15k", color = Color.White)
                                            }
                                        }
                                    ) {
                                        Icon(
                                            imageVector = if (activeTab == MainTab.CROW_ROOSTS) Icons.Default.Navigation else Icons.Outlined.Navigation,
                                            contentDescription = "Crow Roosts"
                                        )
                                    }
                                },
                                label = { Text("Crow Roosts") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Emerald400,
                                    indicatorColor = Emerald500,
                                    unselectedIconColor = Slate400,
                                    unselectedTextColor = Slate400
                                ),
                                modifier = Modifier.testTag("nav_tab_crows")
                            )

                            NavigationBarItem(
                                selected = activeTab == MainTab.NOTABLE_FEED,
                                onClick = { viewModel.setActiveTab(MainTab.NOTABLE_FEED) },
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            if (notableCount.isNotEmpty()) {
                                                Badge(containerColor = Color(0xFFEC4899)) {
                                                    Text(notableCount.size.toString(), color = Color.White)
                                                }
                                            }
                                        }
                                    ) {
                                        Icon(
                                            imageVector = if (activeTab == MainTab.NOTABLE_FEED) Icons.Default.NotificationImportant else Icons.Outlined.NotificationImportant,
                                            contentDescription = "Rare Alerts"
                                        )
                                    }
                                },
                                label = { Text("Rare Alerts") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Emerald400,
                                    indicatorColor = Emerald500,
                                    unselectedIconColor = Slate400,
                                    unselectedTextColor = Slate400
                                ),
                                modifier = Modifier.testTag("nav_tab_notable")
                            )

                            NavigationBarItem(
                                selected = activeTab == MainTab.HOTSPOTS,
                                onClick = { viewModel.setActiveTab(MainTab.HOTSPOTS) },
                                icon = {
                                    Icon(
                                        imageVector = if (activeTab == MainTab.HOTSPOTS) Icons.Default.Place else Icons.Outlined.Place,
                                        contentDescription = "Hotspots"
                                    )
                                },
                                label = { Text("Hotspots") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Emerald400,
                                    indicatorColor = Emerald500,
                                    unselectedIconColor = Slate400,
                                    unselectedTextColor = Slate400
                                ),
                                modifier = Modifier.testTag("nav_tab_hotspots")
                            )

                            NavigationBarItem(
                                selected = activeTab == MainTab.AI_GUIDE,
                                onClick = { viewModel.setActiveTab(MainTab.AI_GUIDE) },
                                icon = {
                                    Icon(
                                        imageVector = if (activeTab == MainTab.AI_GUIDE) Icons.Default.Psychology else Icons.Outlined.Psychology,
                                        contentDescription = "AI Guide"
                                    )
                                },
                                label = { Text("AI Guide") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Emerald400,
                                    indicatorColor = Emerald500,
                                    unselectedIconColor = Slate400,
                                    unselectedTextColor = Slate400
                                ),
                                modifier = Modifier.testTag("nav_tab_ai")
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (activeTab) {
                            MainTab.MAP_FEED -> MapExplorerScreen(viewModel = viewModel)
                            MainTab.CROW_ROOSTS -> CrowRoostTrackerScreen(viewModel = viewModel)
                            MainTab.NOTABLE_FEED -> NotableSightingsScreen(viewModel = viewModel)
                            MainTab.HOTSPOTS -> HotspotsExplorerScreen(viewModel = viewModel)
                            MainTab.AI_GUIDE -> PdxAiChatScreen(viewModel = viewModel)
                        }
                    }

                    // Modals
                    if (viewModel.showReportModal) {
                        ReportRoostModal(
                            onDismiss = { viewModel.showReportModal = false },
                            onSubmit = { count, loc, dir, beh, notes ->
                                viewModel.reportCrowRoost(count, loc, dir, beh, notes)
                                viewModel.showReportModal = false
                            }
                        )
                    }

                    if (viewModel.showApiKeyModal) {
                        ApiKeySettingsModal(
                            onDismiss = { viewModel.showApiKeyModal = false },
                            onSaveKey = { key ->
                                viewModel.loadObservations()
                            }
                        )
                    }
                }
            }
        }
    }
}

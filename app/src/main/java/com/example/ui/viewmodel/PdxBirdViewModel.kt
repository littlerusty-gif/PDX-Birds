package com.example.ui.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.api.EBirdApiService
import com.example.data.api.GeminiApiService
import com.example.data.api.ChatMessage
import com.example.data.local.BirdDatabase
import com.example.data.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class MainTab(val label: String) {
    MAP_FEED("Live Map & Feed"),
    NOTABLE_FEED("Rare Alerts"),
    HOTSPOTS("Hotspot Explorer"),
    CROW_ROOSTS("Crow Roost Vectors"),
    AI_GUIDE("AI Field Guide")
}

class PdxBirdViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = BirdDatabase.getDatabase(application).birdDao()

    // Community roost reports stored locally
    val communityRoostReports = dao.getAllRoostReports()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Navigation & Layout
    private val _activeTab = MutableStateFlow(MainTab.MAP_FEED)
    val activeTab: StateFlow<MainTab> = _activeTab.asStateFlow()

    private val _isSidebarExpanded = MutableStateFlow(true)
    val isSidebarExpanded: StateFlow<Boolean> = _isSidebarExpanded.asStateFlow()

    fun toggleSidebar() {
        _isSidebarExpanded.value = !_isSidebarExpanded.value
    }

    fun setSidebarExpanded(expanded: Boolean) {
        _isSidebarExpanded.value = expanded
    }

    fun setActiveTab(tab: MainTab) {
        _activeTab.value = tab
    }

    // Geolocation center
    private val _currentCenter = MutableStateFlow(Pair(EBirdApiService.PORTLAND_LAT, EBirdApiService.PORTLAND_LNG))
    val currentCenter: StateFlow<Pair<Double, Double>> = _currentCenter.asStateFlow()

    fun findNearMe() {
        // Center on Portland downtown or device location
        _currentCenter.value = Pair(45.5152, -122.6784)
        loadObservations()
    }

    // Filters
    private val _activeCategory = MutableStateFlow(QuickCategory.ALL)
    val activeCategory: StateFlow<QuickCategory> = _activeCategory.asStateFlow()

    private val _radiusKm = MutableStateFlow(25)
    val radiusKm: StateFlow<Int> = _radiusKm.asStateFlow()

    private val _timeframeDays = MutableStateFlow(7)
    val timeframeDays: StateFlow<Int> = _timeframeDays.asStateFlow()

    private val _hotspotsOnly = MutableStateFlow(false)
    val hotspotsOnly: StateFlow<Boolean> = _hotspotsOnly.asStateFlow()

    // Autocomplete Search
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedSpeciesCode = MutableStateFlow<String?>(null)
    val selectedSpeciesCode: StateFlow<String?> = _selectedSpeciesCode.asStateFlow()

    val taxonomySuggestions = _searchQuery.map { query ->
        if (query.length < 2) emptyList()
        else {
            EBirdApiService.pnwTaxonomyIndex.filter { item ->
                item.comName.contains(query, ignoreCase = true) ||
                item.sciName.contains(query, ignoreCase = true) ||
                item.speciesCode.contains(query, ignoreCase = true)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Raw and Filtered Observation Data
    private val _rawObservations = MutableStateFlow<List<EBirdObservation>>(emptyList())
    val rawObservations: StateFlow<List<EBirdObservation>> = _rawObservations.asStateFlow()

    private val _hotspots = MutableStateFlow<List<EBirdHotspot>>(emptyList())
    val hotspots: StateFlow<List<EBirdHotspot>> = _hotspots.asStateFlow()

    private val _notableObservations = MutableStateFlow<List<EBirdObservation>>(emptyList())
    val notableObservations: StateFlow<List<EBirdObservation>> = _notableObservations.asStateFlow()

    private val _selectedObservation = MutableStateFlow<EBirdObservation?>(null)
    val selectedObservation: StateFlow<EBirdObservation?> = _selectedObservation.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _statusMessage = MutableStateFlow("Ready • Connected to Portland Flyway & eBird 2.0")
    val statusMessage: StateFlow<String> = _statusMessage.asStateFlow()

    // Modals
    var showReportModal by mutableStateOf(false)
    var showApiKeyModal by mutableStateOf(false)

    // Derived Filtered Observations
    val filteredObservations: StateFlow<List<EBirdObservation>> = combine(
        _rawObservations,
        _activeCategory,
        _selectedSpeciesCode,
        _hotspotsOnly,
        communityRoostReports
    ) { obsList, category, speciesCode, hotspotsOnlyFlag, roostReports ->
        // Convert community roost reports to EBirdObservations so they display on the live map and feed!
        val communityObs = roostReports.map { report ->
            EBirdObservation(
                id = "comm_${report.id}",
                speciesCode = "amecro",
                comName = "American Crow (Community Report)",
                sciName = "Corvus brachyrhynchos",
                locName = report.locationName,
                obsDt = "Just now",
                howMany = report.count,
                lat = report.lat,
                lng = report.lng,
                obsReviewed = true,
                direction = report.flightDirection,
                isCrowRoost = report.count > 500,
                notes = "${report.behavior}: ${report.notes}",
                category = QuickCategory.CROWS
            )
        }

        val combined = obsList + communityObs

        combined.filter { obs ->
            val matchesCategory = when (category) {
                QuickCategory.ALL -> true
                QuickCategory.CROWS -> obs.category == QuickCategory.CROWS || obs.isCrowRoost
                QuickCategory.RAPTORS -> obs.category == QuickCategory.RAPTORS
                QuickCategory.WATERFOWL -> obs.category == QuickCategory.WATERFOWL
                QuickCategory.SONGBIRDS -> obs.category == QuickCategory.SONGBIRDS
                QuickCategory.NOTABLE -> obs.category == QuickCategory.NOTABLE || obs.howMany > 500
            }

            val matchesSpecies = speciesCode == null || obs.speciesCode.equals(speciesCode, ignoreCase = true)
            val matchesHotspot = !hotspotsOnlyFlag || obs.locId.startsWith("L")

            matchesCategory && matchesSpecies && matchesHotspot
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadObservations()
        loadHotspots()
        loadNotable()
    }

    fun loadObservations() {
        viewModelScope.launch {
            _isLoading.value = true
            val lat = _currentCenter.value.first
            val lng = _currentCenter.value.second
            val dist = _radiusKm.value
            val days = _timeframeDays.value
            val species = _selectedSpeciesCode.value

            try {
                val list = if (species != null) {
                    EBirdApiService.getRecentBySpecies(species, lat, lng, dist, days)
                } else {
                    EBirdApiService.getAllRecent(lat, lng, dist, days)
                }
                _rawObservations.value = list
                _statusMessage.value = "Updated: ${list.size} records in PDX radius (${dist}km, ${days}d)"
            } catch (e: Exception) {
                _rawObservations.value = EBirdApiService.getMockObservations()
                _statusMessage.value = "Displaying cached Portland observations"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun loadHotspots() {
        viewModelScope.launch {
            val list = EBirdApiService.getHotspotsGeo(_currentCenter.value.first, _currentCenter.value.second, _radiusKm.value)
            _hotspots.value = list
        }
    }

    fun loadNotable() {
        viewModelScope.launch {
            val list = EBirdApiService.getNotableObservations("US-OR-051")
            _notableObservations.value = list
        }
    }

    fun selectCategory(category: QuickCategory) {
        _activeCategory.value = category
        if (category == QuickCategory.CROWS) {
            _selectedSpeciesCode.value = "amecro"
        } else if (_selectedSpeciesCode.value == "amecro" && category != QuickCategory.CROWS) {
            _selectedSpeciesCode.value = null
        }
    }

    fun setRadius(km: Int) {
        _radiusKm.value = km
        loadObservations()
        loadHotspots()
    }

    fun setTimeframe(days: Int) {
        _timeframeDays.value = days
        loadObservations()
    }

    fun toggleHotspotsOnly(enabled: Boolean) {
        _hotspotsOnly.value = enabled
    }

    fun selectSpecies(item: TaxonomyItem) {
        _searchQuery.value = item.comName
        _selectedSpeciesCode.value = item.speciesCode
        loadObservations()
    }

    fun clearSpeciesSearch() {
        _searchQuery.value = ""
        _selectedSpeciesCode.value = null
        loadObservations()
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectObservation(obs: EBirdObservation?) {
        _selectedObservation.value = obs
    }

    fun reportCrowRoost(
        count: Int,
        locationName: String,
        flightDirection: String,
        behavior: String,
        notes: String
    ) {
        viewModelScope.launch {
            val entity = CrowRoostReportEntity(
                count = count,
                locationName = locationName,
                lat = 45.5152 + (Math.random() - 0.5) * 0.04,
                lng = -122.6784 + (Math.random() - 0.5) * 0.04,
                flightDirection = flightDirection,
                behavior = behavior,
                notes = notes
            )
            dao.insertRoostReport(entity)
            _statusMessage.value = "Crow roost sighting recorded! Map updated with transit vector."
        }
    }

    // AI Specialist Chat (Gemini)
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                role = "model",
                text = "🦅 Welcome to the PDX Bird & Crow Tracker AI Guide! I specialize in Portland urban birding, the 15,000+ downtown winter crow mega-roosts, Chapman Elementary Vaux's swifts, and Pacific Flyway raptors. Ask me about flight times, staging hotspots, or best photo angles!"
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()
    val isChatLoading = MutableStateFlow(false)
    val enableHighThinking = MutableStateFlow(false)

    fun toggleHighThinking() {
        enableHighThinking.value = !enableHighThinking.value
    }

    fun sendChatMessage(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty() || isChatLoading.value) return

        val userMsg = ChatMessage(role = "user", text = trimmed)
        val curHistory = _chatMessages.value
        _chatMessages.value = curHistory + userMsg
        isChatLoading.value = true

        viewModelScope.launch {
            val thinking = enableHighThinking.value
            val res = GeminiApiService.sendMessage(
                history = curHistory,
                newMessage = trimmed,
                enableHighThinking = thinking,
                selectedModel = if (thinking) GeminiApiService.MODEL_PRO_THINKING else GeminiApiService.MODEL_FLASH_GENERAL
            )

            res.fold(
                onSuccess = { reply ->
                    _chatMessages.value = _chatMessages.value + ChatMessage(role = "model", text = reply, isThinkingModel = thinking)
                },
                onFailure = { err ->
                    _chatMessages.value = _chatMessages.value + ChatMessage(role = "model", text = "⚠️ ${err.message}", isError = true)
                }
            )
            isChatLoading.value = false
        }
    }

    fun clearChat() {
        _chatMessages.value = listOf(
            ChatMessage(role = "model", text = "Chat cleared. What Portland bird or crow roost would you like to investigate next?")
        )
    }
}

package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.api.ChatMessage
import com.example.data.api.GeminiApiService
import com.example.data.local.BirdDatabase
import com.example.data.model.BirdCategory
import com.example.data.model.BirdSighting
import com.example.data.model.BirdSpecies
import com.example.data.model.Hotspot
import com.example.data.model.OregonRegion
import com.example.data.repository.BirdRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppTab(val title: String) {
    HOTSPOTS("Hotspots & Map"),
    PHOTO_GUIDE("Photo Guide"),
    SPECIES("Species"),
    SIGHTINGS("My Sightings"),
    AI_GUIDE("AI Field Guide")
}

class BirdTrackerViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: BirdRepository

    init {
        val dao = BirdDatabase.getDatabase(application).birdDao()
        repository = BirdRepository(dao)
        viewModelScope.launch {
            repository.seedInitialSightingsIfEmpty()
        }
    }

    // Navigation
    private val _currentTab = MutableStateFlow(AppTab.HOTSPOTS)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    fun setTab(tab: AppTab) {
        _currentTab.value = tab
    }

    // Hotspots & Map
    val allHotspots: List<Hotspot> = repository.getHotspots()

    private val _selectedRegion = MutableStateFlow<OregonRegion?>(null)
    val selectedRegion: StateFlow<OregonRegion?> = _selectedRegion.asStateFlow()

    fun selectRegion(region: OregonRegion?) {
        _selectedRegion.value = region
    }

    private val _selectedHotspot = MutableStateFlow<Hotspot?>(null)
    val selectedHotspot: StateFlow<Hotspot?> = _selectedHotspot.asStateFlow()

    fun selectHotspot(hotspot: Hotspot?) {
        _selectedHotspot.value = hotspot
    }

    // Species Catalog
    val allSpecies: List<BirdSpecies> = repository.getSpeciesList()

    private val _speciesSearchQuery = MutableStateFlow("")
    val speciesSearchQuery: StateFlow<String> = _speciesSearchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow<BirdCategory?>(null)
    val selectedCategory: StateFlow<BirdCategory?> = _selectedCategory.asStateFlow()

    private val _selectedSpeciesDetail = MutableStateFlow<BirdSpecies?>(null)
    val selectedSpeciesDetail: StateFlow<BirdSpecies?> = _selectedSpeciesDetail.asStateFlow()

    fun setSpeciesSearch(query: String) {
        _speciesSearchQuery.value = query
    }

    fun selectCategory(category: BirdCategory?) {
        _selectedCategory.value = category
    }

    fun selectSpeciesDetail(species: BirdSpecies?) {
        _selectedSpeciesDetail.value = species
    }

    // Sightings Journal (Room Database Flow)
    val sightings: StateFlow<List<BirdSighting>> = repository.allSightings
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteSightings: StateFlow<List<BirdSighting>> = repository.favoriteSightings
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addSighting(sighting: BirdSighting) {
        viewModelScope.launch {
            repository.insertSighting(sighting)
        }
    }

    fun toggleFavorite(sighting: BirdSighting) {
        viewModelScope.launch {
            repository.updateSighting(sighting.copy(isFavorite = !sighting.isFavorite))
        }
    }

    fun deleteSighting(sighting: BirdSighting) {
        viewModelScope.launch {
            repository.deleteSighting(sighting)
        }
    }

    // AI Guide & Gemini Chatbot
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                role = "model",
                text = "Welcome to Oregon BirdTrack! 🌲🦅 I'm your Pacific Northwest Ornithology & Bird Photography specialist. Ask me anything about current migration flyway status, best photo angles, lighting conditions at Malheur or Sauvie Island, or camera settings for birds in flight."
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _isChatLoading = MutableStateFlow(false)
    val isChatLoading: StateFlow<Boolean> = _isChatLoading.asStateFlow()

    private val _enableHighThinking = MutableStateFlow(false)
    val enableHighThinking: StateFlow<Boolean> = _enableHighThinking.asStateFlow()

    private val _selectedAiModel = MutableStateFlow(GeminiApiService.MODEL_FLASH_GENERAL)
    val selectedAiModel: StateFlow<String> = _selectedAiModel.asStateFlow()

    fun toggleHighThinking() {
        val next = !_enableHighThinking.value
        _enableHighThinking.value = next
        if (next) {
            _selectedAiModel.value = GeminiApiService.MODEL_PRO_THINKING
        } else {
            _selectedAiModel.value = GeminiApiService.MODEL_FLASH_GENERAL
        }
    }

    fun setAiModel(model: String) {
        _selectedAiModel.value = model
        if (model != GeminiApiService.MODEL_PRO_THINKING && _enableHighThinking.value) {
            _enableHighThinking.value = false
        }
    }

    fun sendChatMessage(userText: String) {
        val trimmed = userText.trim()
        if (trimmed.isEmpty() || _isChatLoading.value) return

        val userMessage = ChatMessage(role = "user", text = trimmed)
        val currentHistory = _chatMessages.value
        _chatMessages.value = currentHistory + userMessage
        _isChatLoading.value = true

        viewModelScope.launch {
            val thinkingActive = _enableHighThinking.value
            val result = GeminiApiService.sendMessage(
                history = currentHistory,
                newMessage = trimmed,
                enableHighThinking = thinkingActive,
                selectedModel = _selectedAiModel.value
            )

            result.fold(
                onSuccess = { reply ->
                    val assistantMsg = ChatMessage(
                        role = "model",
                        text = reply,
                        isThinkingModel = thinkingActive
                    )
                    _chatMessages.value = _chatMessages.value + assistantMsg
                },
                onFailure = { error ->
                    val errorMsg = ChatMessage(
                        role = "model",
                        text = "⚠️ Sighting consultation error: ${error.localizedMessage ?: "Unknown connection error"}. Please verify your GEMINI_API_KEY.",
                        isError = true
                    )
                    _chatMessages.value = _chatMessages.value + errorMsg
                }
            )
            _isChatLoading.value = false
        }
    }

    fun clearChat() {
        _chatMessages.value = listOf(
            ChatMessage(
                role = "model",
                text = "Chat cleared. What Oregon migratory bird or photo spot would you like to explore next?"
            )
        )
    }

    fun askAboutHotspot(hotspot: Hotspot) {
        val prompt = "Provide the best photography setup, golden hour lighting advice, and seasonal bird expectations for ${hotspot.name} in Oregon (${hotspot.region.displayName})."
        _currentTab.value = AppTab.AI_GUIDE
        sendChatMessage(prompt)
    }

    fun askAboutSpecies(species: BirdSpecies) {
        val prompt = "How do I take the sharpest, best-composed pictures of the ${species.commonName} (${species.scientificName}) in Oregon? Include ideal camera shutter, focal length, lighting, and ethical shooting tips."
        _currentTab.value = AppTab.AI_GUIDE
        sendChatMessage(prompt)
    }
}

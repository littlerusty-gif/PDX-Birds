package com.example.data.api

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val role: String, // "user" or "model"
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isThinkingModel: Boolean = false,
    val isError: Boolean = false
)

object GeminiApiService {

    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/"

    val MODEL_PRO_THINKING = "gemini-3.1-pro-preview"
    val MODEL_FLASH_GENERAL = "gemini-3.5-flash"
    val MODEL_FLASH_LITE = "gemini-3.1-flash-lite-preview"

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    const val SYSTEM_INSTRUCTION_TEXT = """You are the Pacific Northwest Ornithologist & Master Bird Photographer for Oregon BirdTrack.
You possess world-class knowledge of:
1. Migratory bird patterns across Oregon and the Pacific Flyway (Malheur Basin, Klamath Basin, Sauvie Island, Cannon Beach/Haystack Rock, Columbia Gorge, Summer Lake, etc.).
2. The best photography vantage points: specific spots, compass directions, blinds, and timing (sunrise golden hour mist vs late afternoon front-lighting).
3. Exact camera settings: focal lengths (300mm-800mm), shutter speeds (1/2000s-1/3200s for flight), aperture sweet spots (f/5.6-f/8), ISO limits, exposure compensation for white birds (snow geese, pelicans, white eagle heads).
4. Ethical bird photography standards: keeping distance, avoiding playback during nesting season, respecting buffers at sea stack colonies.

Format your responses with clear markdown headers, concise bullet points, bold key terms, and practical actionable field tips."""

    suspend fun sendMessage(
        history: List<ChatMessage>,
        newMessage: String,
        enableHighThinking: Boolean = false,
        selectedModel: String = MODEL_FLASH_GENERAL
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val apiKey = BuildConfig.GEMINI_API_KEY
            if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                return@withContext Result.failure(
                    IllegalStateException(
                        "Gemini API key is not configured. Please add your GEMINI_API_KEY in the Secrets panel in AI Studio."
                    )
                )
            }

            // If thinking mode is enabled, user MUST use gemini-3.1-pro-preview
            val activeModel = if (enableHighThinking) MODEL_PRO_THINKING else selectedModel
            val url = "$BASE_URL$activeModel:generateContent?key=$apiKey"

            val jsonBody = JSONObject()

            // System instruction
            val systemPart = JSONObject().put("text", SYSTEM_INSTRUCTION_TEXT)
            val systemInstruction = JSONObject().put("parts", JSONArray().put(systemPart))
            jsonBody.put("systemInstruction", systemInstruction)

            // Conversation contents
            val contentsArray = JSONArray()

            // Include prior non-error history
            for (msg in history.filter { !it.isError }) {
                val part = JSONObject().put("text", msg.text)
                val contentObj = JSONObject()
                    .put("role", msg.role)
                    .put("parts", JSONArray().put(part))
                contentsArray.put(contentObj)
            }

            // Append current message
            val currentPart = JSONObject().put("text", newMessage)
            val currentContent = JSONObject()
                .put("role", "user")
                .put("parts", JSONArray().put(currentPart))
            contentsArray.put(currentContent)

            jsonBody.put("contents", contentsArray)

            // Generation config (Thinking level if enabled)
            val generationConfig = JSONObject()
            if (enableHighThinking) {
                val thinkingConfig = JSONObject().put("thinkingLevel", "HIGH")
                generationConfig.put("thinkingConfig", thinkingConfig)
                // Note: Do not set maxOutputTokens when using thinkingLevel
            }
            if (generationConfig.length() > 0) {
                jsonBody.put("generationConfig", generationConfig)
            }

            val requestBody = jsonBody.toString()
                .toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                val errorMsg = try {
                    val errorJson = JSONObject(responseBody)
                    errorJson.optJSONObject("error")?.optString("message") ?: "HTTP ${response.code}"
                } catch (_: Exception) {
                    "HTTP ${response.code}: $responseBody"
                }
                return@withContext Result.failure(Exception(errorMsg))
            }

            val parsedJson = JSONObject(responseBody)
            val candidates = parsedJson.optJSONArray("candidates")
            if (candidates == null || candidates.length() == 0) {
                return@withContext Result.failure(Exception("No response generated from model."))
            }

            val candidate = candidates.getJSONObject(0)
            val content = candidate.optJSONObject("content")
            val parts = content?.optJSONArray("parts")

            val replyText = buildString {
                if (parts != null) {
                    for (i in 0 until parts.length()) {
                        val part = parts.getJSONObject(i)
                        // In thinking models, there might be thought parts or regular text
                        if (part.has("text")) {
                            append(part.getString("text"))
                        }
                    }
                }
            }

            if (replyText.isBlank()) {
                Result.failure(Exception("Empty text response from Gemini API."))
            } else {
                Result.success(replyText.trim())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

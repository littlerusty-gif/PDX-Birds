package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import com.example.data.api.ChatMessage
import com.example.data.api.GeminiApiService
import com.example.ui.theme.Evergreen40
import com.example.ui.theme.GoldenHourGold
import com.example.ui.viewmodel.BirdTrackerViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeminiChatScreen(
    viewModel: BirdTrackerViewModel,
    modifier: Modifier = Modifier
) {
    val messages by viewModel.chatMessages.collectAsState()
    val isLoading by viewModel.isChatLoading.collectAsState()
    val enableHighThinking by viewModel.enableHighThinking.collectAsState()
    val selectedModel by viewModel.selectedAiModel.collectAsState()

    var textInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Scroll to bottom when new messages arrive
    LaunchedEffect(messages.size, isLoading) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    val quickQuestions = remember {
        listOf(
            "🦅 Sunrise vantage point at Malheur NWR?",
            "📷 Shutter & aperture for puffins at Cannon Beach?",
            "🌊 Where are the Vaux's Swifts right now?",
            "🏔️ Winter Bald Eagle hotspots in Klamath Basin",
            "🧭 Plan 2-day Oregon Flyway photo itinerary"
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .testTag("gemini_chat_screen")
    ) {
        // AI Controls & Model Status Header
        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(if (enableHighThinking) Color(0xFF9C27B0) else MaterialTheme.colorScheme.primary)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (enableHighThinking) "High Thinking Active" else "AI Field Specialist",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Clear chat
                    IconButton(
                        onClick = { viewModel.clearChat() },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Clear chat",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // High Thinking Mode Toggle Card
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (enableHighThinking) Color(0xFFF3E5F5) else MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Psychology,
                                    contentDescription = null,
                                    tint = if (enableHighThinking) Color(0xFF7B1FA2) else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Enable High Thinking",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = if (enableHighThinking) Color(0xFF4A148C) else MaterialTheme.colorScheme.onSurface
                                )
                            }
                            Text(
                                text = if (enableHighThinking) "Using gemini-3.1-pro-preview with ThinkingLevel.HIGH" else "Turn on for complex migration routing & lighting calculations",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (enableHighThinking) Color(0xFF6A1B9A) else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Switch(
                            checked = enableHighThinking,
                            onCheckedChange = { viewModel.toggleHighThinking() },
                            modifier = Modifier.testTag("toggle_high_thinking_switch")
                        )
                    }
                }

                // Model Selection Chips (when thinking mode is off)
                if (!enableHighThinking) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilterChip(
                            selected = selectedModel == GeminiApiService.MODEL_FLASH_GENERAL,
                            onClick = { viewModel.setAiModel(GeminiApiService.MODEL_FLASH_GENERAL) },
                            label = { Text("gemini-3.5-flash (General)", style = MaterialTheme.typography.labelSmall) }
                        )
                        FilterChip(
                            selected = selectedModel == GeminiApiService.MODEL_FLASH_LITE,
                            onClick = { viewModel.setAiModel(GeminiApiService.MODEL_FLASH_LITE) },
                            label = { Text("gemini-3.1-flash-lite (Fast)", style = MaterialTheme.typography.labelSmall) }
                        )
                        FilterChip(
                            selected = selectedModel == GeminiApiService.MODEL_PRO_THINKING,
                            onClick = { viewModel.setAiModel(GeminiApiService.MODEL_PRO_THINKING) },
                            label = { Text("gemini-3.1-pro-preview (Complex)", style = MaterialTheme.typography.labelSmall) }
                        )
                    }
                }
            }
        }

        // Quick suggested questions
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            quickQuestions.forEach { prompt ->
                SuggestionChip(
                    onClick = {
                        textInput = ""
                        viewModel.sendChatMessage(prompt)
                    },
                    label = { Text(prompt, style = MaterialTheme.typography.labelSmall) }
                )
            }
        }

        Divider()

        // Message Thread
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .testTag("chat_messages_list"),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                ChatBubble(message = msg)
            }

            if (isLoading) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp,
                            color = if (enableHighThinking) Color(0xFF7B1FA2) else MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = if (enableHighThinking) "Analyzing flyway lighting & telephoto optics (Thinking Mode)..." else "Consulting Pacific Flyway guide...",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        // Chat Input Box
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 3.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .navigationBarsPadding(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = textInput,
                    onValueChange = { textInput = it },
                    placeholder = { Text("Ask about bird locations or photo settings...") },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("chat_input_text_field"),
                    maxLines = 3,
                    shape = RoundedCornerShape(24.dp)
                )

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = {
                        val toSend = textInput
                        textInput = ""
                        viewModel.sendChatMessage(toSend)
                    },
                    enabled = textInput.isNotBlank() && !isLoading,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(
                            if (textInput.isNotBlank() && !isLoading)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.surfaceVariant
                        )
                        .testTag("send_chat_message_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send message",
                        tint = if (textInput.isNotBlank() && !isLoading)
                            MaterialTheme.colorScheme.onPrimary
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(if (message.isThinkingModel) Color(0xFF7B1FA2) else MaterialTheme.colorScheme.primary)
                    .padding(6.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (message.isThinkingModel) Icons.Default.Psychology else Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Surface(
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp
            ),
            color = when {
                isUser -> MaterialTheme.colorScheme.primary
                message.isError -> MaterialTheme.colorScheme.errorContainer
                message.isThinkingModel -> Color(0xFFF3E5F5)
                else -> MaterialTheme.colorScheme.surfaceVariant
            },
            contentColor = when {
                isUser -> MaterialTheme.colorScheme.onPrimary
                message.isError -> MaterialTheme.colorScheme.onErrorContainer
                message.isThinkingModel -> Color(0xFF311B92)
                else -> MaterialTheme.colorScheme.onSurfaceVariant
            },
            modifier = Modifier.widthIn(max = 310.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (message.isThinkingModel) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(bottom = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = null,
                            tint = Color(0xFF7B1FA2),
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "High Thinking Mode (gemini-3.1-pro-preview)",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF7B1FA2)
                        )
                    }
                }

                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyMedium,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

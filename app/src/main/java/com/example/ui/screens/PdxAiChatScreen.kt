package com.example.ui.screens

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
import com.example.ui.theme.*
import com.example.ui.viewmodel.PdxBirdViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdxAiChatScreen(
    viewModel: PdxBirdViewModel,
    modifier: Modifier = Modifier
) {
    val messages by viewModel.chatMessages.collectAsState()
    val isLoading by viewModel.isChatLoading.collectAsState()
    val enableHighThinking by viewModel.enableHighThinking.collectAsState()

    var textInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size, isLoading) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    val quickQuestions = listOf(
        "🦅 Why do 15,000 crows roost in downtown Portland?",
        "📷 Best camera settings for Chapman swifts?",
        "🌲 Where to spot Barred Owls in Forest Park?",
        "🌉 When do crows cross the Hawthorne & Morrison bridges?"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .testTag("pdx_ai_chat_screen")
    ) {
        // Frosted Glass Header with High Thinking Toggle
        Surface(
            color = Slate900,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
            modifier = Modifier.fillMaxWidth()
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
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(if (enableHighThinking) Color(0xFFA855F7) else Emerald500)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "PDX Ornithology & Crow AI Guide",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate100
                        )
                    }

                    IconButton(onClick = { viewModel.clearChat() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Clear", tint = Slate400, modifier = Modifier.size(20.dp))
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // High Thinking Mode Toggle
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (enableHighThinking) Color(0xFF3B0764) else Slate800,
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (enableHighThinking) Color(0xFFA855F7) else Slate700),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Psychology,
                                    contentDescription = null,
                                    tint = if (enableHighThinking) Color(0xFFD8B4FE) else Slate300,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Enable High Thinking (gemini-3.1-pro-preview)",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (enableHighThinking) Color(0xFFF3E8FF) else Slate200
                                )
                            }
                            Text(
                                text = "ThinkingLevel.HIGH for complex flock ecology & solar calculations",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (enableHighThinking) Color(0xFFC084FC) else Slate400
                            )
                        }

                        Switch(
                            checked = enableHighThinking,
                            onCheckedChange = { viewModel.toggleHighThinking() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFFA855F7)
                            )
                        )
                    }
                }
            }
        }

        // Quick Suggestion Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            quickQuestions.forEach { prompt ->
                SuggestionChip(
                    onClick = { viewModel.sendChatMessage(prompt) },
                    label = { Text(prompt, style = MaterialTheme.typography.labelSmall, color = Slate200) },
                    colors = SuggestionChipDefaults.suggestionChipColors(containerColor = Slate900),
                    border = SuggestionChipDefaults.suggestionChipBorder(enabled = true, borderColor = Slate700)
                )
            }
        }

        Divider(color = Slate800)

        // Messages Thread
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                PdxChatBubble(msg)
            }

            if (isLoading) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp,
                            color = if (enableHighThinking) Color(0xFFA855F7) else Emerald500
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = if (enableHighThinking) "Thinking deeply about Portland flyway dynamics..." else "Consulting PDX birding records...",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate400
                        )
                    }
                }
            }
        }

        // Input Field
        Surface(
            color = Slate900,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
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
                    placeholder = { Text("Ask about crow roosts, swifts, or photo spots...", color = Slate400) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate200,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700
                    ),
                    modifier = Modifier.weight(1f),
                    maxLines = 3,
                    shape = RoundedCornerShape(20.dp)
                )

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = {
                        val txt = textInput
                        textInput = ""
                        viewModel.sendChatMessage(txt)
                    },
                    enabled = textInput.isNotBlank() && !isLoading,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (textInput.isNotBlank() && !isLoading) Emerald500 else Slate800)
                ) {
                    Icon(
                        Icons.Default.Send,
                        contentDescription = "Send",
                        tint = if (textInput.isNotBlank() && !isLoading) Color.Black else Slate400
                    )
                }
            }
        }
    }
}

@Composable
fun PdxChatBubble(msg: ChatMessage) {
    val isUser = msg.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(if (msg.isThinkingModel) Color(0xFFA855F7) else Emerald600),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (msg.isThinkingModel) Icons.Default.Psychology else Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Surface(
            shape = RoundedCornerShape(
                topStart = 14.dp,
                topEnd = 14.dp,
                bottomStart = if (isUser) 14.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 14.dp
            ),
            color = when {
                isUser -> Emerald600
                msg.isError -> Color(0xFF7F1D1D)
                msg.isThinkingModel -> Color(0xFF2E1065)
                else -> Slate800
            },
            border = if (!isUser) androidx.compose.foundation.BorderStroke(1.dp, if (msg.isThinkingModel) Color(0xFFA855F7) else Slate700) else null,
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (msg.isThinkingModel) {
                    Text(
                        "🧠 High Thinking Active (gemini-3.1-pro-preview)",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD8B4FE),
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
                Text(
                    text = msg.text,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isUser) Color.Black else Slate100,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

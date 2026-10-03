package com.example.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.api.EBirdApiService
import com.example.ui.theme.*

@Composable
fun ApiKeySettingsModal(
    onDismiss: () -> Unit,
    onSaveKey: (String) -> Unit
) {
    var keyText by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    onSaveKey(keyText)
                    EBirdApiService.setCustomApiKey(keyText)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Save Key")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = Slate400)
            }
        },
        title = {
            Text("eBird API 2.0 Token", fontWeight = FontWeight.Bold, color = Slate100)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    "Enter your personal eBird API token (header 'x-ebirdapitoken'). If left blank, the app gracefully provides authentic Portland winter roost and Pacific Flyway records.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate300
                )

                OutlinedTextField(
                    value = keyText,
                    onValueChange = { keyText = it },
                    label = { Text("eBird Token (x-ebirdapitoken)", color = Slate400) },
                    placeholder = { Text("e.g. 1a2b3c4d5e...") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate200,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("input_ebird_token_key"),
                    singleLine = true
                )

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate800,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        "Status: High-contrast Dark Matter CartoDB map & Multnomah County observations active.",
                        style = MaterialTheme.typography.labelSmall,
                        color = Emerald400,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }
        },
        containerColor = Slate900,
        textContentColor = Slate200
    )
}

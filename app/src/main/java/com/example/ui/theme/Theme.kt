package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkFieldGuideColorScheme = darkColorScheme(
    primary = Emerald500,
    onPrimary = Color.Black,
    primaryContainer = Emerald900,
    onPrimaryContainer = Emerald400,
    secondary = FlockAmber,
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFF451A03),
    onSecondaryContainer = FlockAmber,
    tertiary = FlockTeal,
    onTertiary = Color.Black,
    background = Slate950,
    onBackground = Slate200,
    surface = Slate900,
    onSurface = Slate200,
    surfaceVariant = Slate800,
    onSurfaceVariant = Slate400,
    outline = Slate700,
    outlineVariant = Slate800,
    error = FlockCrimson,
    onError = Color.White
)

@Composable
fun PDXBirdTrackTheme(
    content: @Composable () -> Unit
) {
    // High-contrast Dark Field-Guide Aesthetic (slate-950, emerald green accents, slate-800 cards)
    MaterialTheme(
        colorScheme = DarkFieldGuideColorScheme,
        typography = Typography,
        content = content
    )
}

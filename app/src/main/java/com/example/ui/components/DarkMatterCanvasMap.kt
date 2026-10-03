package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.EBirdObservation
import com.example.ui.theme.*
import kotlin.math.*

@Composable
fun DarkMatterCanvasMap(
    observations: List<EBirdObservation>,
    selectedObservation: EBirdObservation?,
    modifier: Modifier = Modifier,
    onObservationClicked: (EBirdObservation) -> Unit
) {
    // Portland bounds roughly: Lat 45.45 to 45.75, Lng -122.85 to -122.55
    val minLat = 45.45
    val maxLat = 45.76
    val minLng = -122.85
    val maxLng = -122.56

    // Interactive Pan & Zoom
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }
    var scale by remember { mutableStateOf(1f) }

    // Pulsing radar animation for 500+ crow mega-roosts
    val infiniteTransition = rememberInfiniteTransition(label = "RadarPulse")
    val pulseProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseProgress"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(0.dp))
            .background(Slate950)
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    scale = (scale * zoom).coerceIn(0.7f, 3.5f)
                    offsetX += pan.x
                    offsetY += pan.y
                }
            }
            .pointerInput(observations, scale, offsetX, offsetY) {
                detectTapGestures { tapOffset ->
                    val w = size.width.toFloat()
                    val h = size.height.toFloat()

                    var closestObs: EBirdObservation? = null
                    var minDistance = Float.MAX_VALUE

                    for (obs in observations) {
                        val normX = ((obs.lng - minLng) / (maxLng - minLng)).toFloat()
                        val normY = (1.0f - ((obs.lat - minLat) / (maxLat - minLat)).toFloat())

                        val centerX = w * 0.5f + (normX * w - w * 0.5f) * scale + offsetX
                        val centerY = h * 0.5f + (normY * h - h * 0.5f) * scale + offsetY

                        val dx = tapOffset.x - centerX
                        val dy = tapOffset.y - centerY
                        val dist = sqrt(dx * dx + dy * dy)

                        if (dist < 42f && dist < minDistance) {
                            minDistance = dist
                            closestObs = obs
                        }
                    }

                    closestObs?.let { onObservationClicked(it) }
                }
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            fun toScreenX(lng: Double): Float {
                val normX = ((lng - minLng) / (maxLng - minLng)).toFloat()
                return w * 0.5f + (normX * w - w * 0.5f) * scale + offsetX
            }

            fun toScreenY(lat: Double): Float {
                val normY = (1.0f - ((lat - minLat) / (maxLat - minLat)).toFloat())
                return h * 0.5f + (normY * h - h * 0.5f) * scale + offsetY
            }

            // 1. CartoDB Dark Matter Background Grid
            val gridStep = 40f * scale
            val startX = (offsetX % gridStep)
            val startY = (offsetY % gridStep)
            var curX = startX
            while (curX < w) {
                drawLine(
                    color = Color(0xFF0F172A).copy(alpha = 0.5f),
                    start = Offset(curX, 0f),
                    end = Offset(curX, h),
                    strokeWidth = 1f
                )
                curX += gridStep
            }
            var curY = startY
            while (curY < h) {
                drawLine(
                    color = Color(0xFF0F172A).copy(alpha = 0.5f),
                    start = Offset(0f, curY),
                    end = Offset(w, curY),
                    strokeWidth = 1f
                )
                curY += gridStep
            }

            // 2. Columbia River Path (North border)
            val columbiaPath = Path().apply {
                moveTo(toScreenX(-122.85), toScreenY(45.74))
                cubicTo(
                    toScreenX(-122.78), toScreenY(45.68),
                    toScreenX(-122.70), toScreenY(45.62),
                    toScreenX(-122.56), toScreenY(45.58)
                )
            }
            drawPath(
                path = columbiaPath,
                color = Color(0xFF0284C7).copy(alpha = 0.35f),
                style = Stroke(width = 16f * scale, cap = StrokeCap.Round)
            )

            // 3. Willamette River Path (Meandering through downtown Portland)
            val willamettePath = Path().apply {
                moveTo(toScreenX(-122.65), toScreenY(45.45)) // South near Milwaukie / Sellwood
                cubicTo(
                    toScreenX(-122.66), toScreenY(45.49),
                    toScreenX(-122.67), toScreenY(45.51),
                    toScreenX(-122.673), toScreenY(45.52) // Downtown Waterfront & Hawthorne
                )
                cubicTo(
                    toScreenX(-122.68), toScreenY(45.54),
                    toScreenX(-122.74), toScreenY(45.59),
                    toScreenX(-122.76), toScreenY(45.65) // North to Sauvie Island confluence
                )
            }
            drawPath(
                path = willamettePath,
                color = Color(0xFF0284C7).copy(alpha = 0.45f),
                style = Stroke(width = 12f * scale, cap = StrokeCap.Round)
            )

            // 4. Bridges over Willamette (Hawthorne, Morrison, Burnside, Steel, Fremont)
            val bridges = listOf(
                Pair(45.5132, -122.6710), // Hawthorne
                Pair(45.5175, -122.6700), // Morrison
                Pair(45.5230, -122.6690), // Burnside
                Pair(45.5270, -122.6680), // Steel
                Pair(45.5385, -122.6842)  // Fremont
            )
            for (bridge in bridges) {
                val bx = toScreenX(bridge.second)
                val by = toScreenY(bridge.first)
                drawLine(
                    color = Color(0xFF94A3B8).copy(alpha = 0.7f),
                    start = Offset(bx - 12f * scale, by - 4f * scale),
                    end = Offset(bx + 12f * scale, by + 4f * scale),
                    strokeWidth = 3f * scale
                )
            }

            // 5. Downtown Portland Core Mega-Roost Boundary (South Park Blocks to Waterfront)
            val roostCenter = Offset(toScreenX(-122.6784), toScreenY(45.5152))
            drawCircle(
                color = FlockCrimson.copy(alpha = 0.12f),
                radius = 48f * scale,
                center = roostCenter
            )
            drawCircle(
                color = FlockCrimson.copy(alpha = 0.35f),
                radius = 48f * scale,
                center = roostCenter,
                style = Stroke(width = 1.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f)))
            )

            // 6. Draw Observation Markers
            for (obs in observations) {
                val cx = toScreenX(obs.lng)
                val cy = toScreenY(obs.lat)
                val isSelected = selectedObservation?.id == obs.id

                val count = obs.howMany
                val isMegaRoost = obs.isCrowRoost || count > 500

                // Radius sizing
                val baseRadius = when {
                    isMegaRoost -> 16f
                    count > 100 -> 12f
                    count > 20 -> 9f
                    else -> 7f
                } * scale.coerceIn(0.8f, 1.8f)

                // Animated Radar Wave for Mega-Roosts
                if (isMegaRoost) {
                    val waveRadius = baseRadius + (pulseProgress * 32f * scale)
                    val waveAlpha = (1f - pulseProgress).coerceIn(0f, 0.8f)
                    drawCircle(
                        color = FlockCrimson.copy(alpha = waveAlpha * 0.5f),
                        radius = waveRadius,
                        center = Offset(cx, cy)
                    )
                    drawCircle(
                        color = FlockCrimson.copy(alpha = waveAlpha),
                        radius = waveRadius,
                        center = Offset(cx, cy),
                        style = Stroke(width = 1.5f)
                    )
                }

                // Selection Highlight ring
                if (isSelected) {
                    drawCircle(
                        color = Color.White,
                        radius = baseRadius + 6f,
                        center = Offset(cx, cy),
                        style = Stroke(width = 3f)
                    )
                }

                // Marker Body
                drawCircle(
                    color = obs.flockColor,
                    radius = baseRadius,
                    center = Offset(cx, cy)
                )
                drawCircle(
                    color = Color.White,
                    radius = baseRadius,
                    center = Offset(cx, cy),
                    style = Stroke(width = 2f)
                )

                // Directional Transit Vector Arrow
                if (!obs.direction.isNullOrBlank()) {
                    var angleRad = 0.0
                    val dir = obs.direction
                    if (dir.contains("SW", true)) angleRad = Math.PI * 0.75
                    else if (dir.contains("West", true) || dir.contains("W", true)) angleRad = Math.PI
                    else if (dir.contains("East", true) || dir.contains("E", true)) angleRad = 0.0
                    else if (dir.contains("North", true) || dir.contains("N", true)) angleRad = -Math.PI * 0.5
                    else if (dir.contains("South", true) || dir.contains("S", true)) angleRad = Math.PI * 0.5

                    val arrowLen = (baseRadius + 14f * scale)
                    val endX = cx + cos(angleRad).toFloat() * arrowLen
                    val endY = cy + sin(angleRad).toFloat() * arrowLen

                    drawLine(
                        color = Color(0xFF38BDF8),
                        start = Offset(cx, cy),
                        end = Offset(endX, endY),
                        strokeWidth = 2.5f * scale,
                        cap = StrokeCap.Round
                    )
                    drawCircle(
                        color = Color(0xFF38BDF8),
                        radius = 3.5f * scale,
                        center = Offset(endX, endY)
                    )
                }
            }
        }

        // Overlay Legend / Map Controls Badge
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(12.dp)
                .background(Slate900.copy(alpha = 0.85f), RoundedCornerShape(10.dp))
                .border(1.dp, Slate700, RoundedCornerShape(10.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(FlockCrimson)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Dark Matter Vector Map • Willamette Corridor",
                style = MaterialTheme.typography.labelSmall,
                color = Slate200
            )
        }
    }
}

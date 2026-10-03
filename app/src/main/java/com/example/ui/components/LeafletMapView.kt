package com.example.ui.components

import android.annotation.SuppressLint
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.data.model.EBirdObservation
import org.json.JSONArray
import org.json.JSONObject

class MapBridge(private val onObservationSelected: (String) -> Unit) {
    @JavascriptInterface
    fun onObservationClicked(id: String) {
        onObservationSelected(id)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun LeafletMapView(
    observations: List<EBirdObservation>,
    selectedObservation: EBirdObservation?,
    centerLat: Double = 45.5152,
    centerLng: Double = -122.6784,
    zoom: Int = 13,
    modifier: Modifier = Modifier,
    onObservationClicked: (EBirdObservation) -> Unit
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var isMapReady by remember { mutableStateOf(false) }

    val observationsJson = remember(observations) {
        val array = JSONArray()
        for (obs in observations) {
            val obj = JSONObject()
            obj.put("id", obs.id)
            obj.put("speciesCode", obs.speciesCode)
            obj.put("comName", obs.comName)
            obj.put("sciName", obs.sciName)
            obj.put("locName", obs.locName)
            obj.put("obsDt", obs.obsDt)
            obj.put("howMany", obs.howMany)
            obj.put("lat", obs.lat)
            obj.put("lng", obs.lng)
            obj.put("colorHex", obs.flockColorHex)
            obj.put("isCrowRoost", obs.isCrowRoost)
            obj.put("direction", obs.direction ?: "")
            obj.put("notes", obs.notes ?: "")
            obj.put("checklistUrl", obs.checklistUrl)
            obj.put("obsReviewed", obs.obsReviewed)
            array.put(obj)
        }
        array.toString()
    }

    LaunchedEffect(observationsJson, isMapReady) {
        if (isMapReady && webViewRef != null) {
            val safeJson = JSONObject.quote(observationsJson)
            webViewRef?.evaluateJavascript("if (window.renderObservations) { window.renderObservations($safeJson); }", null)
        }
    }

    LaunchedEffect(selectedObservation, isMapReady) {
        if (isMapReady && selectedObservation != null && webViewRef != null) {
            val js = "if (window.flyToObservation) { window.flyToObservation('${selectedObservation.id}', ${selectedObservation.lat}, ${selectedObservation.lng}); }"
            webViewRef?.evaluateJavascript(js, null)
        }
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                // Disable hardware acceleration on WebView to avoid Mesa GPU rendernode errors in virtualized environments
                setLayerType(View.LAYER_TYPE_SOFTWARE, null)

                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.setSupportZoom(true)
                setBackgroundColor(0xFF020617.toInt()) // Slate-950

                webChromeClient = WebChromeClient()
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        isMapReady = true
                        val safeJson = JSONObject.quote(observationsJson)
                        view?.evaluateJavascript("if (window.renderObservations) { window.renderObservations($safeJson); }", null)
                    }

                    // Prevent crashes if Chromium rendering process encounters Mesa virtual node error
                    override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
                        return true
                    }

                    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                        super.onReceivedError(view, request, error)
                    }
                }

                addJavascriptInterface(
                    MapBridge { id ->
                        val found = observations.find { it.id == id }
                        if (found != null) {
                            onObservationClicked(found)
                        }
                    },
                    "AndroidBridge"
                )

                loadDataWithBaseURL("https://leafletjs.com", generateLeafletHtml(centerLat, centerLng, zoom), "text/html", "UTF-8", null)
                webViewRef = this
            }
        },
        update = { webView ->
            webViewRef = webView
        }
    )
}

private fun generateLeafletHtml(lat: Double, lng: Double, zoom: Int): String {
    return """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html, #map { height: 100%; width: 100%; background: #020617; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: #e2e8f0 !important;
          border: 1px solid #10b981 !important;
          border-radius: 14px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
          padding: 4px;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border-left: 1px solid #10b981;
          border-top: 1px solid #10b981;
        }
        .popup-card {
          padding: 6px 4px;
          min-width: 220px;
        }
        .popup-species {
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 2px;
        }
        .popup-scientific {
          font-size: 12px;
          font-style: italic;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .popup-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .popup-count-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          color: #000;
        }
        .popup-loc {
          font-size: 12px;
          color: #cbd5e1;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .popup-transit {
          background: #1e293b;
          color: #38bdf8;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .popup-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #334155;
          padding-top: 6px;
          margin-top: 6px;
        }
        .popup-link {
          color: #10b981;
          text-decoration: none;
          font-weight: 600;
          font-size: 12px;
        }
        .popup-badge-review {
          background: #064e3b;
          color: #34d399;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        /* Pulse Radar Animation for 500+ Crows */
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(2.2); opacity: 0.0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .pulse-marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-ring {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.45);
          animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .pulse-dot {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ef4444;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
        }

        .grad-marker {
          border-radius: 50%;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }

        .transit-arrow {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #0284c7;
          color: #fff;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          border: 1px solid #fff;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([$lat, $lng], $zoom);

        // CartoDB Dark Matter Tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        var markersLayer = L.layerGroup().addTo(map);
        var markerMap = {};

        window.renderObservations = function(rawJson) {
          markersLayer.clearLayers();
          markerMap = {};

          try {
            var observations = JSON.parse(rawJson);
            observations.forEach(function(obs) {
              var count = obs.howMany || 1;
              var isRoost = obs.isCrowRoost || count > 500;
              var color = obs.colorHex || '#14b8a6';

              var iconHtml = '';
              var iconSize = [24, 24];

              var arrowHtml = '';
              if (obs.direction && obs.direction.length > 0) {
                var dirSymbol = '➔';
                if (obs.direction.indexOf('SW') !== -1) dirSymbol = '↙';
                else if (obs.direction.indexOf('West') !== -1 || obs.direction.indexOf('W') !== -1) dirSymbol = '←';
                else if (obs.direction.indexOf('Circl') !== -1) dirSymbol = '⟳';
                else if (obs.direction.indexOf('Roost') !== -1) dirSymbol = '★';
                arrowHtml = '<div class="transit-arrow" title="' + obs.direction + '">' + dirSymbol + '</div>';
              }

              if (isRoost) {
                iconSize = [34, 34];
                iconHtml = '<div class="pulse-marker-container">' +
                           '<div class="pulse-ring"></div>' +
                           '<div class="pulse-dot">' + (count > 999 ? Math.round(count/1000)+'k' : count) + '</div>' +
                           arrowHtml +
                           '</div>';
              } else {
                var radiusPx = count > 100 ? 28 : (count > 20 ? 24 : 18);
                iconSize = [radiusPx, radiusPx];
                var displayText = count > 99 ? '99+' : count;
                iconHtml = '<div class="grad-marker" style="width:'+radiusPx+'px; height:'+radiusPx+'px; background:'+color+'; font-size:'+(radiusPx*0.42)+'px;">' +
                           displayText + arrowHtml +
                           '</div>';
              }

              var customIcon = L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: iconSize,
                iconAnchor: [iconSize[0]/2, iconSize[1]/2]
              });

              var marker = L.marker([obs.lat, obs.lng], { icon: customIcon }).addTo(markersLayer);
              markerMap[obs.id] = marker;

              var popupHtml = '<div class="popup-card">' +
                '<div class="popup-species">' + obs.comName + '</div>' +
                '<div class="popup-scientific">' + obs.sciName + '</div>' +
                '<div class="popup-row">' +
                  '<span class="popup-count-badge" style="background:' + color + ';">' + count.toLocaleString() + ' birds</span>' +
                  '<span class="popup-badge-review">' + (obs.obsReviewed ? '✓ Confirmed' : 'Reported') + '</span>' +
                '</div>' +
                '<div class="popup-loc">📍 ' + obs.locName + '</div>';

              if (obs.direction && obs.direction.length > 0) {
                popupHtml += '<div class="popup-transit">🧭 Vector: ' + obs.direction + '</div>';
              }
              if (obs.notes && obs.notes.length > 0) {
                popupHtml += '<div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">' + obs.notes + '</div>';
              }

              popupHtml += '<div class="popup-footer">' +
                '<span style="font-size:11px; color:#64748b;">' + obs.obsDt + '</span>' +
                '<a class="popup-link" href="' + obs.checklistUrl + '" target="_blank">View eBird ↗</a>' +
              '</div></div>';

              marker.bindPopup(popupHtml);

              marker.on('click', function() {
                if (window.AndroidBridge && window.AndroidBridge.onObservationClicked) {
                  window.AndroidBridge.onObservationClicked(obs.id);
                }
              });
            });
          } catch(e) {
            console.error('Error rendering observations:', e);
          }
        };

        window.flyToObservation = function(id, lat, lng) {
          map.flyTo([lat, lng], 15, { animate: true, duration: 1.0 });
          var marker = markerMap[id];
          if (marker) {
            marker.openPopup();
          }
        };
      </script>
    </body>
    </html>
    """.trimIndent()
}

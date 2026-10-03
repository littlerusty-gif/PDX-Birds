package com.example.data.api

import com.example.BuildConfig
import com.example.data.model.EBirdHotspot
import com.example.data.model.EBirdObservation
import com.example.data.model.QuickCategory
import com.example.data.model.TaxonomyItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object EBirdApiService {

    private const val BASE_URL = "https://api.ebird.org/v2/"
    const val PORTLAND_LAT = 45.5152
    const val PORTLAND_LNG = -122.6784

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    // Cached curated taxonomy of Pacific Northwest / Portland species for immediate fast autocomplete
    val pnwTaxonomyIndex = listOf(
        TaxonomyItem("American Crow", "Corvus brachyrhynchos", "amecro", "species", "Corvidae"),
        TaxonomyItem("Common Raven", "Corvus corax", "comrav", "species", "Corvidae"),
        TaxonomyItem("Vaux's Swift", "Chaetura vauxi", "vauxsw", "species", "Apodidae"),
        TaxonomyItem("Peregrine Falcon", "Falco peregrinus", "perfal", "species", "Falconidae"),
        TaxonomyItem("Red-tailed Hawk", "Buteo jamaicensis", "rethaw", "species", "Accipitridae"),
        TaxonomyItem("Cooper's Hawk", "Accipiter cooperii", "coohaw", "species", "Accipitridae"),
        TaxonomyItem("Bald Eagle", "Haliaeetus leucocephalus", "baleag", "species", "Accipitridae"),
        TaxonomyItem("Osprey", "Pandion haliaetus", "osprey", "species", "Pandionidae"),
        TaxonomyItem("Great Blue Heron", "Ardea herodias", "grbher", "species", "Ardeidae"),
        TaxonomyItem("Great Egret", "Ardea alba", "greegr", "species", "Ardeidae"),
        TaxonomyItem("Wood Duck", "Aix sponsa", "wooduc", "species", "Anatidae"),
        TaxonomyItem("Mallard", "Anas platyrhynchos", "mallar3", "species", "Anatidae"),
        TaxonomyItem("Cackling Goose", "Branta hutchinsii", "cackgo", "species", "Anatidae"),
        TaxonomyItem("Canada Goose", "Branta canadensis", "cangoo", "species", "Anatidae"),
        TaxonomyItem("Sandhill Crane", "Antigone canadensis", "sancra", "species", "Gruidae"),
        TaxonomyItem("Barred Owl", "Strix varia", "brdowl", "species", "Strigidae"),
        TaxonomyItem("Western Screech-Owl", "Megascops kennicottii", "wesowl1", "species", "Strigidae"),
        TaxonomyItem("Northern Pygmy-Owl", "Glaucidium gnoma", "nopowl", "species", "Strigidae"),
        TaxonomyItem("Anna's Hummingbird", "Calypte anna", "annhum", "species", "Trochilidae"),
        TaxonomyItem("Rufous Hummingbird", "Selasphorus rufus", "rufhum", "species", "Trochilidae"),
        TaxonomyItem("Western Tanager", "Piranga ludoviciana", "westan", "species", "Cardinalidae"),
        TaxonomyItem("Cedar Waxwing", "Bombycilla cedrorum", "cedwax", "species", "Bombycillidae"),
        TaxonomyItem("Varied Thrush", "Ixoreus naevius", "varthr", "species", "Turdidae"),
        TaxonomyItem("American Robin", "Turdus migratorius", "amerob", "species", "Turdidae"),
        TaxonomyItem("Black-capped Chickadee", "Poecile atricapillus", "bkcchi", "species", "Paridae"),
        TaxonomyItem("Steller's Jay", "Cyanocitta stelleri", "stejay", "species", "Corvidae"),
        TaxonomyItem("California Scrub-Jay", "Aphelocoma californica", "casjay", "species", "Corvidae"),
        TaxonomyItem("Snowy Owl", "Bubo scandiacus", "snoowl1", "species", "Strigidae"),
        TaxonomyItem("Northern Goshawk", "Accipiter gentilis", "norgos", "species", "Accipitridae")
    )

    // Check environment for eBird API key (BuildConfig injected or custom override)
    private var customApiKey: String? = null

    fun setCustomApiKey(key: String) {
        customApiKey = key.trim().takeIf { it.isNotEmpty() }
    }

    private fun getApiKey(): String {
        val key = customApiKey ?: try {
            val field = BuildConfig::class.java.getField("EBIRD_API_KEY")
            (field.get(null) as? String ?: "").replace("\"", "").trim()
        } catch (_: Exception) {
            ""
        }
        return if (key.isBlank() || key == "DEFAULT_KEY" || key == "YOUR_EBIRD_API_KEY") "" else key
    }

    // 1. Specific species recent observations
    suspend fun getRecentBySpecies(
        speciesCode: String,
        lat: Double = PORTLAND_LAT,
        lng: Double = PORTLAND_LNG,
        distKm: Int = 35,
        backDays: Int = 14
    ): List<EBirdObservation> = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isBlank()) {
            return@withContext getMockObservations().filter {
                it.speciesCode.equals(speciesCode, ignoreCase = true)
            }.ifEmpty { getMockObservations().take(6) }
        }

        val url = "${BASE_URL}data/obs/geo/recent/$speciesCode?lat=$lat&lng=$lng&dist=$distKm&back=$backDays"
        try {
            val request = Request.Builder()
                .url(url)
                .addHeader("x-ebirdapitoken", apiKey)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext getMockObservations().filter {
                    it.speciesCode.equals(speciesCode, ignoreCase = true)
                }
            }

            val body = response.body?.string().orEmpty()
            parseObservationsJson(body)
        } catch (e: Exception) {
            getMockObservations().filter { it.speciesCode.equals(speciesCode, ignoreCase = true) }
        }
    }

    // 2. All recent observations
    suspend fun getAllRecent(
        lat: Double = PORTLAND_LAT,
        lng: Double = PORTLAND_LNG,
        distKm: Int = 25,
        backDays: Int = 7
    ): List<EBirdObservation> = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isBlank()) {
            return@withContext getMockObservations()
        }

        val url = "${BASE_URL}data/obs/geo/recent?lat=$lat&lng=$lng&dist=$distKm&back=$backDays&sort=date"
        try {
            val request = Request.Builder()
                .url(url)
                .addHeader("x-ebirdapitoken", apiKey)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext getMockObservations()
            }

            val body = response.body?.string().orEmpty()
            val list = parseObservationsJson(body)
            if (list.isEmpty()) getMockObservations() else list
        } catch (e: Exception) {
            getMockObservations()
        }
    }

    // 3. Hotspots in geo radius
    suspend fun getHotspotsGeo(
        lat: Double = PORTLAND_LAT,
        lng: Double = PORTLAND_LNG,
        distKm: Int = 25
    ): List<EBirdHotspot> = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isBlank()) {
            return@withContext getMockHotspots()
        }

        val url = "${BASE_URL}ref/hotspot/geo?lat=$lat&lng=$lng&dist=$distKm&fmt=json"
        try {
            val request = Request.Builder()
                .url(url)
                .addHeader("x-ebirdapitoken", apiKey)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext getMockHotspots()
            }

            val body = response.body?.string().orEmpty()
            val arr = JSONArray(body)
            val result = mutableListOf<EBirdHotspot>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                result.add(
                    EBirdHotspot(
                        locId = obj.optString("locId"),
                        locName = obj.optString("locName"),
                        lat = obj.optDouble("lat"),
                        lng = obj.optDouble("lng"),
                        numSpeciesAllTime = obj.optInt("numSpeciesAllTime", 50),
                        latestObsDt = obj.optString("latestObsDt")
                    )
                )
            }
            if (result.isEmpty()) getMockHotspots() else result
        } catch (e: Exception) {
            getMockHotspots()
        }
    }

    // 4. Notable / Rare sightings feed (Multnomah County: US-OR-051)
    suspend fun getNotableObservations(
        regionCode: String = "US-OR-051"
    ): List<EBirdObservation> = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isBlank()) {
            return@withContext getMockNotableObservations()
        }

        val url = "${BASE_URL}data/obs/$regionCode/recent/notable?detail=full"
        try {
            val request = Request.Builder()
                .url(url)
                .addHeader("x-ebirdapitoken", apiKey)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext getMockNotableObservations()
            }

            val body = response.body?.string().orEmpty()
            val list = parseObservationsJson(body, defaultCategory = QuickCategory.NOTABLE)
            if (list.isEmpty()) getMockNotableObservations() else list
        } catch (e: Exception) {
            getMockNotableObservations()
        }
    }

    private fun parseObservationsJson(
        jsonString: String,
        defaultCategory: QuickCategory = QuickCategory.ALL
    ): List<EBirdObservation> {
        return try {
            val arr = JSONArray(jsonString)
            val list = mutableListOf<EBirdObservation>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                val code = obj.optString("speciesCode")
                val com = obj.optString("comName")
                val howMany = obj.optInt("howMany", 1)
                val isCrow = code.equals("amecro", true) || com.contains("Crow", true)
                val category = when {
                    isCrow -> QuickCategory.CROWS
                    code in listOf("rethaw", "baleag", "perfal", "coohaw", "brdowl", "osprey") -> QuickCategory.RAPTORS
                    code in listOf("grbher", "greegr", "wooduc", "mallar3", "cackgo", "cangoo") -> QuickCategory.WATERFOWL
                    defaultCategory == QuickCategory.NOTABLE -> QuickCategory.NOTABLE
                    else -> QuickCategory.SONGBIRDS
                }

                list.add(
                    EBirdObservation(
                        speciesCode = code,
                        comName = com,
                        sciName = obj.optString("sciName"),
                        locId = obj.optString("locId"),
                        locName = obj.optString("locName"),
                        obsDt = obj.optString("obsDt"),
                        howMany = howMany,
                        lat = obj.optDouble("lat"),
                        lng = obj.optDouble("lng"),
                        obsReviewed = obj.optBoolean("obsReviewed", true),
                        presenceNoted = obj.optBoolean("presenceNoted", false),
                        subId = obj.optString("subId"),
                        direction = if (isCrow && howMany > 200) "SW toward Downtown" else null,
                        isCrowRoost = isCrow && howMany > 500,
                        notes = if (isCrow && howMany > 500) "Major evening roost aggregation" else null,
                        category = category
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Rich Portland Mock Data (Winter Crow Mega-Roosts, Chapman Swifts, Hotspots)
    fun getMockObservations(): List<EBirdObservation> {
        return listOf(
            // Portland Winter Crow Mega-Roosts (500+ vivid crimson pulse markers)
            EBirdObservation(
                speciesCode = "amecro",
                comName = "American Crow",
                sciName = "Corvus brachyrhynchos",
                locId = "L901001",
                locName = "South Park Blocks (Downtown Mega-Roost)",
                obsDt = "2026-10-02 18:45",
                howMany = 8500,
                lat = 45.5140,
                lng = -122.6825,
                obsReviewed = true,
                subId = "S14298102",
                direction = "Roosting (Elms & Maples)",
                isCrowRoost = true,
                notes = "Massive winter roost canopy filled with vocalizations. Birds settling into tall downtown deciduous trees.",
                category = QuickCategory.CROWS
            ),
            EBirdObservation(
                speciesCode = "amecro",
                comName = "American Crow",
                sciName = "Corvus brachyrhynchos",
                locId = "L901002",
                locName = "Tom McCall Waterfront Park (Morrison to Hawthorne)",
                obsDt = "2026-10-02 18:15",
                howMany = 12000,
                lat = 45.5165,
                lng = -122.6730,
                obsReviewed = true,
                subId = "S14298103",
                direction = "SW toward Downtown Core",
                isCrowRoost = true,
                notes = "Tremendous river corridor flight stream crossing the Willamette into downtown trees.",
                category = QuickCategory.CROWS
            ),
            EBirdObservation(
                speciesCode = "amecro",
                comName = "American Crow",
                sciName = "Corvus brachyrhynchos",
                locId = "L901003",
                locName = "Lloyd Center Rooftop Staging Zone",
                obsDt = "2026-10-02 17:30",
                howMany = 2400,
                lat = 45.5320,
                lng = -122.6540,
                obsReviewed = true,
                subId = "S14298104",
                direction = "SW toward Bridges",
                isCrowRoost = true,
                notes = "Eastside staging aggregation before crossing the river into downtown roost sites.",
                category = QuickCategory.CROWS
            ),
            EBirdObservation(
                speciesCode = "amecro",
                comName = "American Crow",
                sciName = "Corvus brachyrhynchos",
                locId = "L901004",
                locName = "Hawthorne Bridge East Pier Flight Corridor",
                obsDt = "2026-10-02 18:00",
                howMany = 3800,
                lat = 45.5132,
                lng = -122.6685,
                obsReviewed = true,
                subId = "S14298105",
                direction = "West across Willamette",
                isCrowRoost = true,
                notes = "Continuous stream of crows flying low over river water into the city.",
                category = QuickCategory.CROWS
            ),
            EBirdObservation(
                speciesCode = "vauxsw",
                comName = "Vaux's Swift",
                sciName = "Chaetura vauxi",
                locId = "L120045",
                locName = "Chapman Elementary School Chimney",
                obsDt = "2026-10-02 19:10",
                howMany = 4200,
                lat = 45.5342,
                lng = -122.7125,
                obsReviewed = true,
                subId = "S14298106",
                direction = "Circling Funnel",
                isCrowRoost = false,
                notes = "Spectacular funnel vortex spiraling down into the historic school brick chimney at twilight.",
                category = QuickCategory.SONGBIRDS
            ),
            EBirdObservation(
                speciesCode = "perfal",
                comName = "Peregrine Falcon",
                sciName = "Falco peregrinus",
                locId = "L200192",
                locName = "Fremont Bridge Arch",
                obsDt = "2026-10-02 16:20",
                howMany = 2,
                lat = 45.5385,
                lng = -122.6842,
                obsReviewed = true,
                subId = "S14298107",
                direction = "Eastbound hunting dive",
                category = QuickCategory.RAPTORS,
                notes = "Pair perched on bridge steel structure scanning for incoming waterfowl and starlings."
            ),
            EBirdObservation(
                speciesCode = "baleag",
                comName = "Bald Eagle",
                sciName = "Haliaeetus leucocephalus",
                locId = "L300182",
                locName = "Oaks Bottom Wildlife Refuge - North Lagoon",
                obsDt = "2026-10-02 11:30",
                howMany = 3,
                lat = 45.4795,
                lng = -122.6540,
                obsReviewed = true,
                subId = "S14298108",
                direction = "Perched",
                category = QuickCategory.RAPTORS,
                notes = "Adult and two juveniles perched in tall cottonwood tree overlooking the lagoon."
            ),
            EBirdObservation(
                speciesCode = "grbher",
                comName = "Great Blue Heron",
                sciName = "Ardea herodias",
                locId = "L400293",
                locName = "Crystal Springs Rhododendron Garden",
                obsDt = "2026-10-02 14:15",
                howMany = 7,
                lat = 45.4790,
                lng = -122.6345,
                obsReviewed = true,
                subId = "S14298109",
                direction = "Foraging in spring ponds",
                category = QuickCategory.WATERFOWL,
                notes = "Several herons stalking trout in the clear spring waters."
            ),
            EBirdObservation(
                speciesCode = "wooduc",
                comName = "Wood Duck",
                sciName = "Aix sponsa",
                locId = "L400293",
                locName = "Crystal Springs Rhododendron Garden",
                obsDt = "2026-10-02 14:20",
                howMany = 18,
                lat = 45.4792,
                lng = -122.6342,
                obsReviewed = true,
                subId = "S14298110",
                direction = "Resting",
                category = QuickCategory.WATERFOWL,
                notes = "Brilliant males in full breeding plumage resting along shaded mossy bank."
            ),
            EBirdObservation(
                speciesCode = "sancra",
                comName = "Sandhill Crane",
                sciName = "Antigone canadensis",
                locId = "L500391",
                locName = "Sauvie Island - Renton Rd Agricultural Fields",
                obsDt = "2026-10-02 09:40",
                howMany = 65,
                lat = 45.7150,
                lng = -122.8120,
                obsReviewed = true,
                subId = "S14298111",
                direction = "North flyway banking",
                category = QuickCategory.WATERFOWL,
                notes = "Bugling family groups foraging in corn stubble with Mount St. Helens visible in distance."
            ),
            EBirdObservation(
                speciesCode = "brdowl",
                comName = "Barred Owl",
                sciName = "Strix varia",
                locId = "L600129",
                locName = "Forest Park - Lower Macleay Trail",
                obsDt = "2026-10-02 08:30",
                howMany = 1,
                lat = 45.5360,
                lng = -122.7155,
                obsReviewed = true,
                subId = "S14298112",
                direction = "Roosting in Hemlock",
                category = QuickCategory.RAPTORS,
                notes = "Calm adult owl perched 25 feet up next to Balch Creek."
            ),
            EBirdObservation(
                speciesCode = "rethaw",
                comName = "Red-tailed Hawk",
                sciName = "Buteo jamaicensis",
                locId = "L700219",
                locName = "Mount Tabor Park Summit",
                obsDt = "2026-10-02 13:00",
                howMany = 2,
                lat = 45.5120,
                lng = -122.5950,
                obsReviewed = true,
                subId = "S14298113",
                direction = "Soaring on updrafts",
                category = QuickCategory.RAPTORS
            ),
            EBirdObservation(
                speciesCode = "annhum",
                comName = "Anna's Hummingbird",
                sciName = "Calypte anna",
                locId = "L800112",
                locName = "Portland Japanese Garden",
                obsDt = "2026-10-02 10:15",
                howMany = 5,
                lat = 45.5188,
                lng = -122.7075,
                obsReviewed = true,
                subId = "S14298114",
                direction = "Territorial dive displays",
                category = QuickCategory.SONGBIRDS
            )
        )
    }

    fun getMockNotableObservations(): List<EBirdObservation> {
        return listOf(
            EBirdObservation(
                speciesCode = "snoowl1",
                comName = "Snowy Owl",
                sciName = "Bubo scandiacus",
                locId = "L99001",
                locName = "Sauvie Island - Columbia River North Spit",
                obsDt = "2026-10-02 15:45",
                howMany = 1,
                lat = 45.7480,
                lng = -122.7950,
                obsReviewed = true,
                subId = "S14299901",
                direction = "Perched on driftwood",
                notes = "RARE IRRUPTIVE SIGHTING! Immature female resting on high driftwood log overlooking the Columbia channel.",
                category = QuickCategory.NOTABLE
            ),
            EBirdObservation(
                speciesCode = "norgos",
                comName = "Northern Goshawk",
                sciName = "Accipiter gentilis",
                locId = "L99002",
                locName = "Forest Park - Wildwood Trail Mile 14",
                obsDt = "2026-10-02 09:10",
                howMany = 1,
                lat = 45.5680,
                lng = -122.7550,
                obsReviewed = true,
                subId = "S14299902",
                direction = "Rapid low flight through Douglas firs",
                notes = "CONFIRMED NOTABLE! Adult accipiter hunting ruffed grouse in dense conifer canopy.",
                category = QuickCategory.NOTABLE
            ),
            EBirdObservation(
                speciesCode = "harspa",
                comName = "Harris's Sparrow",
                sciName = "Zonotrichia querula",
                locId = "L99003",
                locName = "Kelly Point Park - Confluence Willows",
                obsDt = "2026-10-02 11:00",
                howMany = 1,
                lat = 45.6510,
                lng = -122.7660,
                obsReviewed = true,
                subId = "S14299903",
                direction = "Foraging in mixed sparrow flock",
                notes = "Uncommon winter vagrant with Golden-crowned Sparrows along the willow thicket trail.",
                category = QuickCategory.NOTABLE
            )
        )
    }

    fun getMockHotspots(): List<EBirdHotspot> {
        return listOf(
            EBirdHotspot("L120045", "Chapman Elementary School (Swifts)", 45.5342, -122.7125, 62),
            EBirdHotspot("L901001", "South Park Blocks (Downtown Crow Roost)", 45.5140, -122.6825, 84),
            EBirdHotspot("L901002", "Tom McCall Waterfront Park", 45.5165, -122.6730, 115),
            EBirdHotspot("L300182", "Oaks Bottom Wildlife Refuge", 45.4795, -122.6540, 182),
            EBirdHotspot("L400293", "Crystal Springs Rhododendron Garden", 45.4790, -122.6345, 142),
            EBirdHotspot("L700219", "Mount Tabor Park", 45.5120, -122.5950, 138),
            EBirdHotspot("L500391", "Sauvie Island Wildlife Area", 45.7150, -122.8120, 275),
            EBirdHotspot("L600129", "Forest Park - Lower Macleay Trail", 45.5360, -122.7155, 96),
            EBirdHotspot("L800291", "Smith and Bybee Wetlands", 45.6150, -122.7280, 210),
            EBirdHotspot("L99003", "Kelly Point Park", 45.6510, -122.7660, 168)
        )
    }
}

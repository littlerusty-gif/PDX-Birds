import React, { useState, useEffect, useMemo } from 'react';
import { Observation, Hotspot, ViewMode, TaxonomyItem, CrowRoostReport, FlightCorridor, RegionConfig } from './types/bird';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { ReportModal } from './components/ReportModal';
import { AiRoostWidget } from './components/AiRoostWidget';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS, FLIGHT_CORRIDORS } from './data/mockPortlandData';
import { PRIMARY_REGIONS } from './data/regions';
import { isSpeciesOptimalNow } from './data/viewingForecast';
import { fetchObservationsForRegion, fetchHotspotsForRegion } from './services/ebirdService';

export const App: React.FC = () => {
  const [currentRegion, setCurrentRegion] = useState<RegionConfig>(PRIMARY_REGIONS[0]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [mode, setMode] = useState<ViewMode>('recent');
  const [selectedSpecies, setSelectedSpecies] = useState<TaxonomyItem | null>(null);
  const [observations, setObservations] = useState<Observation[]>(MOCK_OBSERVATIONS);
  const [hotspots, setHotspots] = useState<Hotspot[]>(MOCK_HOTSPOTS);
  const [selectedItem, setSelectedItem] = useState<Observation | Hotspot | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<FlightCorridor | null>(null);
  const [filterBestNow, setFilterBestNow] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [aiCustomQuestion, setAiCustomQuestion] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic data fetching across chosen region (GPS, Metro, State, or Nationwide)
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (mode === 'hotspots') {
          const spots = await fetchHotspotsForRegion(currentRegion);
          if (!isCancelled) {
            setHotspots(spots);
          }
        } else {
          const obs = await fetchObservationsForRegion(
            currentRegion,
            mode,
            mode === 'species' ? selectedSpecies?.speciesCode : undefined
          );
          if (!isCancelled) {
            setObservations(obs);
          }
        }
      } catch (err) {
        console.warn('Error loading regional telemetry, using fallback:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [currentRegion, mode, selectedSpecies]);

  // "Use My Location" GPS Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);

        const gpsRegion: RegionConfig = {
          id: 'gps',
          name: 'Current Location (GPS)',
          category: 'gps',
          center: [lat, lng],
          zoom: 12,
          description: 'Observations within 30 miles of your current GPS location.',
          lat,
          lng,
          distMiles: 30,
        };

        setCurrentRegion(gpsRegion);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        alert(`Unable to retrieve your location: ${error.message || 'Permission denied'}.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Nationwide search and "Best to View Right Now" active filtering
  const displayedObservations = useMemo(() => {
    let result = observations;

    // 1. Peak window filter
    if (filterBestNow) {
      result = result.filter((obs) => isSpeciesOptimalNow(obs.speciesCode));
    }

    // 2. Nationwide Search Filter across Common Name, Scientific Name, Code, or Location
    const q = searchFilter.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (obs) =>
          obs.comName.toLowerCase().includes(q) ||
          obs.sciName.toLowerCase().includes(q) ||
          obs.speciesCode.toLowerCase().includes(q) ||
          obs.locName.toLowerCase().includes(q) ||
          (obs.notes && obs.notes.toLowerCase().includes(q))
      );
    }

    return result;
  }, [observations, filterBestNow, searchFilter]);

  // Handle reporting new community roost sighting
  const handleReportSighting = async (report: Omit<CrowRoostReport, 'id' | 'timestamp'>) => {
    try {
      let newRep = report as any;
      try {
        const res = await fetch('/api/birds/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
        newRep = await res.json();
      } catch (postErr) {
        console.warn('Proxy post failed, appending locally:', postErr);
      }

      const heading = report.flightHeadingDeg ?? 225;
      const backAngle = (heading + 180) % 360;
      const originLat = report.lat + Math.cos((backAngle * Math.PI) / 180) * 0.024;
      const originLng =
        report.lng + (Math.sin((backAngle * Math.PI) / 180) * 0.024) / Math.cos((report.lat * Math.PI) / 180);
      const trajectoryCoords: [number, number][] = [
        [originLat, originLng],
        [report.lat, report.lng],
      ];

      const newObs: Observation = {
        id: `comm-${newRep.id || Date.now()}`,
        speciesCode: 'amecro',
        comName: `${newRep.species || report.species} (Community Sighting)`,
        sciName: 'Corvus brachyrhynchos',
        locId: 'COMM_USER',
        locName: newRep.locationName || report.locationName,
        obsDt: 'Just now',
        howMany: newRep.count || report.count,
        lat: newRep.lat || report.lat,
        lng: newRep.lng || report.lng,
        obsReviewed: true,
        subId: 'COMMUNITY',
        direction: newRep.direction || report.direction,
        originStagingArea: newRep.originStagingArea || report.originStagingArea,
        flightHeadingDeg: heading,
        trajectoryCoords,
        isCrowRoost: (newRep.count || report.count) >= 250,
        notes: `${newRep.behavior || report.behavior}: ${newRep.notes || report.notes}`,
      };

      setObservations((prev) => [newObs, ...prev]);
      setSelectedItem(newObs);
      setIsReportModalOpen(false);
    } catch (err) {
      console.error('Failed to report sighting:', err);
    }
  };

  const handleOpenAiWithQuestion = (question: string) => {
    setAiCustomQuestion(question);
    setIsAiWidgetOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Nationwide Header with Region Selector & Autocomplete Search */}
      <Header
        mode={mode}
        onSetMode={(newMode) => {
          setMode(newMode);
          setSelectedItem(null);
        }}
        selectedSpecies={selectedSpecies}
        onSelectSpecies={(species) => {
          setSelectedSpecies(species);
          setSelectedItem(null);
          if (species) {
            setSearchFilter(species.comName);
          }
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAiWidget={() => {
          setAiCustomQuestion(undefined);
          setIsAiWidgetOpen(true);
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        filterBestNow={filterBestNow}
        onToggleFilterBestNow={() => setFilterBestNow((prev) => !prev)}
        currentRegion={currentRegion}
        onSelectRegion={(reg) => {
          setCurrentRegion(reg);
          setSelectedItem(null);
          setSelectedCorridor(null);
        }}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        observations={observations}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
      />

      {/* Main View Area: Sidebar Pane + Dynamic Map */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Collapsible Left Intelligence Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          mode={mode}
          observations={displayedObservations}
          hotspots={hotspots}
          selectedItem={selectedItem}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setSelectedCorridor(null);
          }}
          isLoading={isLoading}
          corridors={FLIGHT_CORRIDORS}
          selectedCorridor={selectedCorridor}
          onSelectCorridor={(corridor) => {
            setSelectedCorridor(corridor);
            setSelectedItem(null);
          }}
          filterBestNow={filterBestNow}
          onToggleFilterBestNow={() => setFilterBestNow((prev) => !prev)}
          currentRegion={currentRegion}
        />

        {/* 100% Viewport Height Leaflet Map with Dynamic Center & Geolocation */}
        <Map
          observations={displayedObservations}
          hotspots={hotspots}
          selectedItem={selectedItem}
          mode={mode}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setSelectedCorridor(null);
          }}
          corridors={FLIGHT_CORRIDORS}
          selectedCorridor={selectedCorridor}
          onSelectCorridor={(corridor) => {
            setSelectedCorridor(corridor);
            setSelectedItem(null);
          }}
          region={currentRegion}
          userLocation={userLocation}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
        />
      </div>

      {/* Mobile Sighting Details Bottom Sheet (<768px) */}
      <MobileBottomSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenAiWidget={handleOpenAiWithQuestion}
      />

      {/* Community Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSighting}
      />

      {/* Gemini AI Roost Intelligence & Optimal Viewing Forecast Widget */}
      <AiRoostWidget
        isOpen={isAiWidgetOpen}
        onClose={() => setIsAiWidgetOpen(false)}
        initialQuestion={aiCustomQuestion}
        observations={observations}
        filterBestNow={filterBestNow}
        onToggleFilterBestNow={() => setFilterBestNow((prev) => !prev)}
      />
    </div>
  );
};

export default App;

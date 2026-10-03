import React, { useState, useEffect, useMemo } from 'react';
import { Observation, Hotspot, ViewMode, TaxonomyItem, CrowRoostReport, FlightCorridor } from './types/bird';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { ReportModal } from './components/ReportModal';
import { AiRoostWidget } from './components/AiRoostWidget';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS, FLIGHT_CORRIDORS } from './data/mockPortlandData';
import { isSpeciesOptimalNow } from './data/viewingForecast';

export const App: React.FC = () => {
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

  // Fetch data based on active mode
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (mode === 'species' && selectedSpecies) {
          const res = await fetch(`/api/birds/recent/${selectedSpecies.speciesCode}?dist=35&back=14`);
          const data = await res.json();
          setObservations(data);
        } else if (mode === 'recent') {
          const res = await fetch('/api/birds/recent?dist=25&back=7');
          const data = await res.json();
          setObservations(data);
        } else if (mode === 'notable') {
          const res = await fetch('/api/birds/notable');
          const data = await res.json();
          setObservations(data);
        } else if (mode === 'hotspots') {
          const res = await fetch('/api/birds/hotspots?dist=25');
          const data = await res.json();
          setHotspots(data);
        }
      } catch (err) {
        console.warn('Backend proxy fetch failed, using realistic mock data:', err);
        if (mode === 'species' && selectedSpecies) {
          setObservations(MOCK_OBSERVATIONS.filter(o => o.speciesCode.toLowerCase() === selectedSpecies.speciesCode.toLowerCase()));
        } else if (mode === 'notable') {
          setObservations(MOCK_NOTABLE);
        } else if (mode === 'hotspots') {
          setHotspots(MOCK_HOTSPOTS);
        } else {
          setObservations(MOCK_OBSERVATIONS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, selectedSpecies]);

  // Filter observations when "Best to View Right Now" quick filter is active
  const displayedObservations = useMemo(() => {
    if (!filterBestNow) return observations;
    return observations.filter((obs) => isSpeciesOptimalNow(obs.speciesCode));
  }, [observations, filterBestNow]);

  // Handle reporting new community roost sighting with flight vector calculation
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

      // Calculate back-traced vector pointing toward the sighting pin
      const heading = report.flightHeadingDeg ?? 225;
      const backAngle = (heading + 180) % 360;
      const originLat = report.lat + Math.cos((backAngle * Math.PI) / 180) * 0.024;
      const originLng =
        report.lng + (Math.sin((backAngle * Math.PI) / 180) * 0.024) / Math.cos((report.lat * Math.PI) / 180);
      const trajectoryCoords: [number, number][] = [
        [originLat, originLng],
        [report.lat, report.lng],
      ];

      // Add to current observation feed directly
      const newObs: Observation = {
        id: `comm-${newRep.id || Date.now()}`,
        speciesCode: 'amecro',
        comName: `${newRep.species || report.species} (Community Sighting)`,
        sciName: 'Corvus brachyrhynchos',
        locId: 'COMM_PDX',
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

      setObservations(prev => [newObs, ...prev]);
      setSelectedItem(newObs);
    } catch (err) {
      console.error('Failed to process community report:', err);
    }
  };

  const handleOpenAiWithQuestion = (question?: string) => {
    setAiCustomQuestion(question);
    setIsAiWidgetOpen(true);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-slate-950 font-sans relative">
      {/* Header (Desktop: Top Bar / Mobile: Stacked over map) */}
      <Header
        mode={mode}
        onSetMode={(m) => {
          setMode(m);
          setSelectedItem(null);
          setSelectedCorridor(null);
        }}
        selectedSpecies={selectedSpecies}
        onSelectSpecies={(sp) => {
          setSelectedSpecies(sp);
          if (sp) setMode('species');
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAiWidget={() => handleOpenAiWithQuestion()}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        filterBestNow={filterBestNow}
        onToggleFilterBestNow={() => setFilterBestNow(prev => !prev)}
      />

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-[100dvh] md:h-full min-h-[500px] overflow-hidden flex">
        {/* Collapsible Observation & Origin Routes Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
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
          onToggleFilterBestNow={() => setFilterBestNow(prev => !prev)}
        />

        {/* 100% Viewport Height Leaflet Map with Flight Paths & Inbound Vectors */}
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
        onToggleFilterBestNow={() => setFilterBestNow(prev => !prev)}
      />
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Observation, Hotspot, ViewMode, TaxonomyItem, CrowRoostReport } from './types/bird';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { ReportModal } from './components/ReportModal';
import { AiRoostWidget } from './components/AiRoostWidget';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS } from './data/mockPortlandData';

export const App: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('recent');
  const [selectedSpecies, setSelectedSpecies] = useState<TaxonomyItem | null>(null);
  const [observations, setObservations] = useState<Observation[]>(MOCK_OBSERVATIONS);
  const [hotspots, setHotspots] = useState<Hotspot[]>(MOCK_HOTSPOTS);
  const [selectedItem, setSelectedItem] = useState<Observation | Hotspot | null>(null);
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

  // Handle reporting new community roost sighting
  const handleReportSighting = async (report: Omit<CrowRoostReport, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/birds/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      const newRep = await res.json();

      // Add to current observation feed directly
      const newObs: Observation = {
        id: `comm-${newRep.id}`,
        speciesCode: 'amecro',
        comName: `${newRep.species} (Community Sighting)`,
        sciName: 'Corvus brachyrhynchos',
        locId: 'COMM_PDX',
        locName: newRep.locationName,
        obsDt: 'Just now',
        howMany: newRep.count,
        lat: newRep.lat,
        lng: newRep.lng,
        obsReviewed: true,
        subId: 'COMMUNITY',
        direction: newRep.direction,
        isCrowRoost: newRep.count >= 250,
        notes: `${newRep.behavior}: ${newRep.notes}`
      };

      setObservations(prev => [newObs, ...prev]);
      setSelectedItem(newObs);
    } catch (err) {
      console.error('Failed to post community report:', err);
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
      />

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-[100dvh] md:h-full min-h-[500px] overflow-hidden flex">
        {/* Collapsible Observation List Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          mode={mode}
          observations={observations}
          hotspots={hotspots}
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItem(item)}
          isLoading={isLoading}
        />

        {/* 100% Viewport Height Leaflet Map (100dvh) with touch-drag enabled */}
        <Map
          observations={observations}
          hotspots={hotspots}
          selectedItem={selectedItem}
          mode={mode}
          onSelectItem={(item) => setSelectedItem(item)}
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

      {/* Gemini AI Roost Intelligence Widget */}
      <AiRoostWidget
        isOpen={isAiWidgetOpen}
        onClose={() => setIsAiWidgetOpen(false)}
        initialQuestion={aiCustomQuestion}
      />
    </div>
  );
};

export default App;

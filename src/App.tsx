import React, { useState, useEffect, useMemo } from 'react';
import { Observation, Hotspot, ViewMode, TaxonomyItem, CrowRoostReport, FlightCorridor, RegionConfig } from './types/bird';
import { MeetupProposal } from './types/chat';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { ReportModal } from './components/ReportModal';
import { AiRoostWidget } from './components/AiRoostWidget';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { LocationModal } from './components/LocationModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FieldChatDrawer } from './components/FieldChatDrawer';
import { DisclaimerModal } from './components/DisclaimerModal';
import { HandleModal } from './components/HandleModal';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS, FLIGHT_CORRIDORS } from './data/mockPortlandData';
import { PRIMARY_REGIONS } from './data/regions';
import { isSpeciesOptimalNow } from './data/viewingForecast';
import { fetchObservationsForRegion, fetchHotspotsForRegion } from './services/ebirdService';

const STORAGE_KEY_HANDLE = 'thebirdbook_handle';
const STORAGE_KEY_HOME_REGION = 'thebirdbook_home_region';
const STORAGE_KEY_DISCLAIMER = 'thebirdbook_disclaimer_signed';

export const App: React.FC = () => {
  const [currentRegion, setCurrentRegion] = useState<RegionConfig>(PRIMARY_REGIONS[0]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('birdbook_welcome_dismissed');
    } catch {
      return true;
    }
  });

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

  // Field Chat & Community Meetup state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState<boolean>(false);
  const [userHandle, setUserHandle] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HANDLE) || '';
    } catch {
      return '';
    }
  });
  const [userHomeRegion, setUserHomeRegion] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HOME_REGION) || 'OR-Metro';
    } catch {
      return 'OR-Metro';
    }
  });
  const [pinnedMeetup, setPinnedMeetup] = useState<MeetupProposal | null>(null);

  // Dynamic data fetching across chosen region (GPS, Metro, State, or Nationwide)
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (mode === 'hotspots') {
          const spots = await fetchHotspotsForRegion(currentRegion);
          if (!isCancelled && Array.isArray(spots)) {
            setHotspots(spots);
          }
        } else {
          const obs = await fetchObservationsForRegion(
            currentRegion,
            mode,
            mode === 'species' ? selectedSpecies?.speciesCode : undefined
          );
          if (!isCancelled && Array.isArray(obs)) {
            setObservations(obs);
          }
        }
      } catch (err) {
        console.warn('Safe catch in loadData, retaining fallback:', err);
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
          name: 'Current Location (GPS Nearby)',
          category: 'gps',
          center: [lat, lng],
          zoom: 12,
          description: 'Observations within 30 miles / 50 km of your current GPS location.',
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

  // Reset to Default View handler for Error Boundary
  const handleResetToDefault = () => {
    setCurrentRegion(PRIMARY_REGIONS[0]);
    setUserLocation(null);
    setSelectedSpecies(null);
    setSelectedItem(null);
    setSelectedCorridor(null);
    setSearchFilter('');
    setFilterBestNow(false);
    setMode('recent');
    setObservations(MOCK_OBSERVATIONS);
    setHotspots(MOCK_HOTSPOTS);
    setPinnedMeetup(null);
  };

  // Close welcome location modal and mark session
  const handleDismissLocationModal = () => {
    setIsLocationModalOpen(false);
    try {
      sessionStorage.setItem('birdbook_welcome_dismissed', 'true');
    } catch {
      // safe ignore
    }
  };

  // Field Chat: Check/Request Disclaimer agreement
  const handleRequestDisclaimer = (): boolean => {
    try {
      const agreed = localStorage.getItem(STORAGE_KEY_DISCLAIMER) === 'true';
      if (!agreed) {
        setIsDisclaimerOpen(true);
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  // Field Chat: Check/Request Handle creation
  const handleRequestHandle = (): string | null => {
    if (userHandle && userHandle.trim().length >= 3) {
      return userHandle;
    }
    setIsHandleModalOpen(true);
    return null;
  };

  // Agree to legal disclaimer
  const handleAgreeDisclaimer = () => {
    try {
      localStorage.setItem(STORAGE_KEY_DISCLAIMER, 'true');
    } catch {}
    setIsDisclaimerOpen(false);
    setIsChatOpen(true);

    // If handle not yet created, prompt for it
    if (!userHandle) {
      setIsHandleModalOpen(true);
    }
  };

  // Save permanent handle & home region
  const handleSaveHandle = (handle: string, homeRegion: string) => {
    setUserHandle(handle);
    setUserHomeRegion(homeRegion);
    try {
      localStorage.setItem(STORAGE_KEY_HANDLE, handle);
      localStorage.setItem(STORAGE_KEY_HOME_REGION, homeRegion);
    } catch {}
    setIsHandleModalOpen(false);
  };

  // Open Field Chat Drawer
  const handleOpenChat = () => {
    const isAgreed = handleRequestDisclaimer();
    if (isAgreed) {
      setIsChatOpen(true);
    }
  };

  // Pin proposed meetup to map
  const handlePinMeetupToMap = (meetup: MeetupProposal) => {
    setPinnedMeetup(meetup);
    // Center map on meetup
    if (meetup.lat && meetup.lng) {
      setSelectedItem(null);
    }
  };

  // Nationwide search and "Best to View Right Now" active filtering
  const displayedObservations = useMemo(() => {
    if (!Array.isArray(observations)) return [];
    let result = observations;

    if (filterBestNow) {
      result = result.filter((obs) => isSpeciesOptimalNow(obs.speciesCode));
    }

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
    <div className="flex flex-col w-full h-screen min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Nationwide Header with Region Selector, Search & Field Chat */}
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
          setObservations([]);
        }}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        observations={observations}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
        onOpenChat={handleOpenChat}
      />

      {/* Main View Area with React Error Boundary */}
      <ErrorBoundary onReset={handleResetToDefault}>
        <div className="flex-1 w-full h-full relative flex overflow-hidden">
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

          {/* 100% Viewport Height Leaflet Map Container */}
          <div className="flex-1 w-full h-full min-w-0 relative">
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
              pinnedMeetup={pinnedMeetup}
            />
          </div>
        </div>
      </ErrorBoundary>

      {/* Regional Community Meetup & Field Chat Drawer */}
      <FieldChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentRegion={currentRegion}
        nearbyHotspots={hotspots}
        onPinMeetupToMap={handlePinMeetupToMap}
        onRequestDisclaimer={handleRequestDisclaimer}
        onRequestHandle={handleRequestHandle}
        homeRegion={userHomeRegion}
      />

      {/* Explicit Legal Liability & Outdoor Excursion Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onAgree={handleAgreeDisclaimer}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Permanent Field Handle Selection Modal */}
      <HandleModal
        isOpen={isHandleModalOpen}
        currentHandle={userHandle}
        currentHomeRegion={userHomeRegion}
        onSave={handleSaveHandle}
        onClose={() => setIsHandleModalOpen(false)}
      />

      {/* Initial Welcome Location Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={handleDismissLocationModal}
        onSelectRegion={(reg) => {
          setCurrentRegion(reg);
          setSelectedItem(null);
          setSelectedCorridor(null);
          setObservations([]);
        }}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
      />

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

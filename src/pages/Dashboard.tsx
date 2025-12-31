import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccidents } from '@/hooks/useAccidents';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterTabs } from '@/components/FilterTabs';
import { AccidentCard } from '@/components/AccidentCard';
import { AccidentStatus } from '@/types/database';
import { Loader2, RadioTower } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { station } = useAuth();
  const { accidents, loading, acknowledgeAccident, resolveAccident, simulateAccident } = useAccidents();
  const [activeFilter, setActiveFilter] = useState<AccidentStatus | 'all'>('all');

  const filteredAccidents = useMemo(() => {
    if (activeFilter === 'all') return accidents;
    return accidents.filter(a => a.status === activeFilter);
  }, [accidents, activeFilter]);

  const counts = useMemo(() => ({
    all: accidents.length,
    pending: accidents.filter(a => a.status === 'pending').length,
    acknowledged: accidents.filter(a => a.status === 'acknowledged').length,
    resolved: accidents.filter(a => a.status === 'resolved').length,
  }), [accidents]);

  const handleAcknowledge = async (accidentId: string) => {
    if (station) {
      await acknowledgeAccident(accidentId, station.id);
    }
  };

  const handleResolve = async (accidentId: string) => {
    if (station) {
      await resolveAccident(accidentId, station.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSimulate={simulateAccident} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsOverview accidents={accidents} />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold">Incident Feed</h2>
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        </div>

        {filteredAccidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-secondary/50 rounded-full mb-4">
              <RadioTower className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No incidents to display</h3>
            <p className="text-muted-foreground mt-1">
              {activeFilter === 'all' 
                ? 'Click "Simulate Accident" to test the system'
                : `No ${activeFilter} incidents at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAccidents.map((accident) => (
              <AccidentCard
                key={accident.id}
                accident={accident}
                stationId={station?.id}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

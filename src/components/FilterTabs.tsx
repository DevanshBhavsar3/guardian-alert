import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccidentStatus } from '@/types/database';

interface FilterTabsProps {
  activeFilter: AccidentStatus | 'all';
  onFilterChange: (filter: AccidentStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    acknowledged: number;
    resolved: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ 
  activeFilter, 
  onFilterChange,
  counts 
}) => {
  return (
    <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as AccidentStatus | 'all')}>
      <TabsList className="bg-secondary/50 p-1">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          All ({counts.all})
        </TabsTrigger>
        <TabsTrigger 
          value="pending"
          className="data-[state=active]:bg-status-pending data-[state=active]:text-white"
        >
          Pending ({counts.pending})
        </TabsTrigger>
        <TabsTrigger 
          value="acknowledged"
          className="data-[state=active]:bg-status-acknowledged data-[state=active]:text-black"
        >
          In Progress ({counts.acknowledged})
        </TabsTrigger>
        <TabsTrigger 
          value="resolved"
          className="data-[state=active]:bg-status-resolved data-[state=active]:text-white"
        >
          Resolved ({counts.resolved})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

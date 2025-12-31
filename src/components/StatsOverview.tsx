import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accident } from '@/types/database';
import { AlertTriangle, Clock, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  accidents: Accident[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ accidents }) => {
  const stats = {
    total: accidents.length,
    pending: accidents.filter(a => a.status === 'pending').length,
    acknowledged: accidents.filter(a => a.status === 'acknowledged').length,
    resolved: accidents.filter(a => a.status === 'resolved').length,
    critical: accidents.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
  };

  const statCards = [
    {
      label: 'Total Incidents',
      value: stats.total,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Pending Response',
      value: stats.pending,
      icon: AlertTriangle,
      color: 'text-status-pending',
      bgColor: 'bg-status-pending/10',
      pulse: stats.pending > 0,
    },
    {
      label: 'In Progress',
      value: stats.acknowledged,
      icon: Clock,
      color: 'text-status-acknowledged',
      bgColor: 'bg-status-acknowledged/10',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-status-resolved',
      bgColor: 'bg-status-resolved/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className={cn(
          'glass-panel transition-all duration-300 hover:border-primary/50',
          stat.pulse && 'border-status-pending/50'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={cn('text-3xl font-bold mt-1', stat.color)}>{stat.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {stats.critical > 0 && (
        <Card className="col-span-2 lg:col-span-4 border-severity-critical/50 bg-severity-critical/5 animate-pulse-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-severity-critical" />
              <div>
                <p className="font-bold text-severity-critical">
                  {stats.critical} CRITICAL {stats.critical === 1 ? 'INCIDENT' : 'INCIDENTS'} REQUIRING IMMEDIATE ATTENTION
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  These incidents need urgent response from available stations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

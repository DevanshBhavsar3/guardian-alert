import React from 'react';
import { Accident } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Shield,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AccidentCardProps {
  accident: Accident;
  stationId: string | undefined;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const severityConfig = {
  critical: {
    className: 'severity-badge-critical',
    icon: AlertTriangle,
  },
  high: {
    className: 'severity-badge-high',
    icon: AlertTriangle,
  },
  medium: {
    className: 'severity-badge-medium',
    icon: AlertTriangle,
  },
  low: {
    className: 'severity-badge-low',
    icon: Shield,
  },
};

const statusConfig = {
  pending: {
    label: 'Pending Response',
    className: 'status-pending',
    bgClass: 'bg-status-pending/10 border-status-pending/30',
  },
  acknowledged: {
    label: 'In Progress',
    className: 'status-acknowledged',
    bgClass: 'bg-status-acknowledged/10 border-status-acknowledged/30',
  },
  resolved: {
    label: 'Resolved',
    className: 'status-resolved',
    bgClass: 'bg-status-resolved/10 border-status-resolved/30',
  },
};

export const AccidentCard: React.FC<AccidentCardProps> = ({
  accident,
  stationId,
  onAcknowledge,
  onResolve,
}) => {
  const severity = severityConfig[accident.severity];
  const status = statusConfig[accident.status];
  const SeverityIcon = severity.icon;

  const canAcknowledge = accident.status === 'pending' && stationId;
  const canResolve = accident.status === 'acknowledged' && accident.acknowledged_by === stationId;
  const isOwner = accident.acknowledged_by === stationId;

  return (
    <Card className={cn(
      'glass-panel overflow-hidden transition-all duration-300 hover:border-primary/50 animate-slide-in-up',
      accident.severity === 'critical' && accident.status === 'pending' && 'border-severity-critical/50 animate-pulse-glow'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              accident.severity === 'critical' ? 'bg-severity-critical/20' :
              accident.severity === 'high' ? 'bg-severity-high/20' :
              accident.severity === 'medium' ? 'bg-severity-medium/20' :
              'bg-severity-low/20'
            )}>
              <SeverityIcon className={cn(
                'h-5 w-5',
                accident.severity === 'critical' ? 'text-severity-critical' :
                accident.severity === 'high' ? 'text-severity-high' :
                accident.severity === 'medium' ? 'text-severity-medium' :
                'text-severity-low'
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{accident.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={severity.className}>
                  {accident.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={status.bgClass}>
                  <span className={status.className}>{status.label}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {accident.description && (
          <p className="text-muted-foreground text-sm">{accident.description}</p>
        )}
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{accident.location_address || `${accident.location_lat.toFixed(4)}, ${accident.location_lng.toFixed(4)}`}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Reported {formatDistanceToNow(new Date(accident.reported_at), { addSuffix: true })}</span>
          </div>
          {accident.station && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Handled by: <span className="text-foreground font-medium">{accident.station.name}</span></span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {canAcknowledge && (
            <Button 
              onClick={() => onAcknowledge(accident.id)}
              variant="warning"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-1" />
              Acknowledge & Claim
            </Button>
          )}
          
          {canResolve && (
            <Button 
              onClick={() => onResolve(accident.id)}
              variant="success"
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark as Resolved
            </Button>
          )}

          {accident.status === 'acknowledged' && !isOwner && (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              Being handled by another station
            </div>
          )}

          {accident.status === 'resolved' && (
            <div className="flex-1 text-center py-2 text-sm text-status-resolved font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Resolved {accident.resolved_at && formatDistanceToNow(new Date(accident.resolved_at), { addSuffix: true })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

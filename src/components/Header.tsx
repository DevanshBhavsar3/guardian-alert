import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Radio, Siren } from "lucide-react";

interface HeaderProps {
  onSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSimulate }) => {
  const { station, signOut } = useAuth();

  return (
    <header className="glass-panel border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Radio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Guardian Alert
                </h1>
                <p className="text-xs text-muted-foreground">
                  Emergency Response System
                </p>
              </div>
            </div>

            {station && (
              <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <div className="w-2 h-2 bg-status-resolved rounded-full animate-pulse" />
                <span className="text-sm font-medium">{station.name}</span>
                <span className="text-xs text-muted-foreground">• Online</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onSimulate}
              variant="critical"
              className="hidden sm:flex"
            >
              <Siren className="h-4 w-4 mr-1" />
              Simulate Accident
            </Button>
            <Button
              onClick={onSimulate}
              variant="critical"
              size="icon"
              className="sm:hidden"
            >
              <Siren className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

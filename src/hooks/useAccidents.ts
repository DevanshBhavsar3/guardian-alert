import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accident,
  AccidentSeverity,
  AccidentStatus,
  Station,
} from "@/types/database";
import { useToast } from "@/hooks/use-toast";

export const useAccidents = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccidents = async () => {
    const { data, error } = await supabase
      .from("accidents")
      .select(
        `
        *,
        station:acknowledged_by(*)
      `,
      )
      .order("reported_at", { ascending: false });

    if (error) {
      console.error("Error fetching accidents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accidents",
        variant: "destructive",
      });
    } else {
      setAccidents(data as Accident[]);
    }
    setLoading(false);
  };

  const acknowledgeAccident = async (accidentId: string, stationId: string) => {
    const { error } = await supabase
      .from("accidents")
      .update({
        status: "acknowledged" as AccidentStatus,
        acknowledged_by: stationId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", accidentId)
      .eq("status", "pending");

    if (error) {
      toast({
        title: "Error",
        description:
          "Failed to acknowledge accident. It may have already been claimed.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Accident acknowledged successfully",
    });
    return true;
  };

  const resolveAccident = async (accidentId: string, stationId: string) => {
    const { error } = await supabase
      .from("accidents")
      .update({
        status: "resolved" as AccidentStatus,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", accidentId)
      .eq("acknowledged_by", stationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resolve accident",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Accident resolved successfully",
    });
    return true;
  };

  const simulateAccident = async () => {
    const severities: AccidentSeverity[] = [
      "critical",
      "high",
      "medium",
      "low",
    ];
    const titles = [
      "Vehicle Collision",
      "Fire Reported",
      "Medical Emergency",
      "Hazardous Spill",
      "Building Collapse",
      "Power Line Down",
    ];
    const addresses = [
      "123 Main Street",
      "456 Oak Avenue",
      "789 Pine Road",
      "321 Elm Boulevard",
      "654 Maple Lane",
    ];

    const { error } = await supabase.from("accidents").insert({
      title: titles[Math.floor(Math.random() * titles.length)],
      description: "Simulated accident for testing purposes",
      severity: severities[Math.floor(Math.random() * severities.length)],
      location_lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      location_lng: -74.006 + (Math.random() - 0.5) * 0.1,
      location_address: addresses[Math.floor(Math.random() * addresses.length)],
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to simulate accident",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Alert Sent!",
        description: "New accident has been reported to all stations",
      });
    }
  };

  useEffect(() => {
    fetchAccidents();

    const channel = supabase
      .channel("accidents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accidents",
        },
        (payload) => {
          fetchAccidents();

          if (payload.eventType === "INSERT") {
            const newAccident = payload.new as Accident;
            toast({
              title: "🚨 New Accident Alert!",
              description: `${newAccident.title} - ${newAccident.severity.toUpperCase()}`,
              variant:
                newAccident.severity === "critical" ? "destructive" : "default",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    accidents,
    loading,
    acknowledgeAccident,
    resolveAccident,
    simulateAccident,
    refetch: fetchAccidents,
  };
};

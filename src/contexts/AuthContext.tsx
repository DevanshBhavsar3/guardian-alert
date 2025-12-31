import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Station } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  station: Station | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    stationName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStation = async (userId: string) => {
    const { data, error } = await supabase
      .from("stations")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setStation(data as Station);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchStation(session.user.id);
      } else {
        setStation(null);
      }
      setLoading(false);
    });

    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   setSession(session);
    //   setUser(session?.user ?? null);
    //   if (session?.user) {
    //     fetchStation(session.user.id);
    //   }
    //   setLoading(false);
    // });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    stationName: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) return { error };

    if (data.user) {
      // Create station for the new user with location
      const { error: stationError } = await supabase.from("stations").insert({
        user_id: data.user.id,
        name: stationName,
        // TODO: Ask for location
        location_lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        location_lng: -74.006 + (Math.random() - 0.5) * 0.1,
      });

      if (stationError) {
        return { error: new Error(stationError.message) };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setStation(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, station, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

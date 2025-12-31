-- Create enum for accident severity
CREATE TYPE public.accident_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- Create enum for accident status
CREATE TYPE public.accident_status AS ENUM ('pending', 'acknowledged', 'resolved');

-- Create stations table
CREATE TABLE public.stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accidents table
CREATE TABLE public.accidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity accident_severity NOT NULL DEFAULT 'medium',
  status accident_status NOT NULL DEFAULT 'pending',
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_by UUID REFERENCES public.stations(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accidents ENABLE ROW LEVEL SECURITY;

-- Stations policies
CREATE POLICY "Users can view all stations" 
ON public.stations FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create their own station" 
ON public.stations FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own station" 
ON public.stations FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Accidents policies
CREATE POLICY "Authenticated users can view all accidents" 
ON public.accidents FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create accidents" 
ON public.accidents FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accidents" 
ON public.accidents FOR UPDATE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stations_updated_at
BEFORE UPDATE ON public.stations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accidents_updated_at
BEFORE UPDATE ON public.accidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for accidents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.accidents;
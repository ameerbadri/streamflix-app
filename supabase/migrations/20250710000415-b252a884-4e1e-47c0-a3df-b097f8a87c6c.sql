-- Create table for cast members
CREATE TABLE public.cast_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL,
  tmdb_person_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  character_name TEXT,
  profile_picture_url TEXT,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for crew members
CREATE TABLE public.crew_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL,
  tmdb_person_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  job TEXT NOT NULL,
  department TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cast_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view cast/crew)
CREATE POLICY "Anyone can view cast members" 
ON public.cast_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view crew members" 
ON public.crew_members 
FOR SELECT 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.cast_members 
ADD CONSTRAINT cast_members_movie_id_fkey 
FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;

ALTER TABLE public.crew_members 
ADD CONSTRAINT crew_members_movie_id_fkey 
FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_cast_members_movie_id ON public.cast_members(movie_id);
CREATE INDEX idx_cast_members_tmdb_person_id ON public.cast_members(tmdb_person_id);
CREATE INDEX idx_crew_members_movie_id ON public.crew_members(movie_id);
CREATE INDEX idx_crew_members_tmdb_person_id ON public.crew_members(tmdb_person_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_cast_members_updated_at
BEFORE UPDATE ON public.cast_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_members_updated_at
BEFORE UPDATE ON public.crew_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create submissions table for storing user submitted data
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    bodyweight DOUBLE PRECISION NOT NULL,
    added_weight DOUBLE PRECISION NOT NULL,
    reps INTEGER NOT NULL,
    form_quality TEXT NOT NULL CHECK (form_quality IN ('Competition', 'Minor_Cheat', 'Major_Cheat')),
    penalty_weight DOUBLE PRECISION NOT NULL DEFAULT 0,
    user_name TEXT, -- 用户名字或社媒账号（选填）
    video_url TEXT, -- 视频链接（选填）
    pullup_type TEXT NOT NULL CHECK (pullup_type IN ('Overhand', 'Underhand')), -- 引体类型：正手或反手
    is_processed BOOLEAN DEFAULT FALSE
);

-- Create formulas table for storing calculated formula coefficients
CREATE TABLE IF NOT EXISTS public.formulas (
    id SERIAL PRIMARY KEY,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    coeff_a DOUBLE PRECISION NOT NULL,
    coeff_b DOUBLE PRECISION NOT NULL,
    coeff_c DOUBLE PRECISION NOT NULL,
    coeff_d DOUBLE PRECISION NOT NULL,
    coeff_e DOUBLE PRECISION NOT NULL,
    coeff_f DOUBLE PRECISION NOT NULL,
    total_submissions_used INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gender)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_gender ON public.submissions(gender);
CREATE INDEX IF NOT EXISTS idx_submissions_processed ON public.submissions(is_processed);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_formulas_gender ON public.formulas(gender);

-- Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;

-- Create policies for submissions table
CREATE POLICY "Allow public read access to submissions" ON public.submissions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to submissions" ON public.submissions
    FOR INSERT WITH CHECK (true);

-- Create policies for formulas table
CREATE POLICY "Allow public read access to formulas" ON public.formulas
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.submissions TO anon;
GRANT SELECT ON public.formulas TO anon;
GRANT USAGE ON SEQUENCE formulas_id_seq TO anon;

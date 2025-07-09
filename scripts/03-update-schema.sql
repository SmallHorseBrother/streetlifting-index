-- Add new columns to existing submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS pullup_type TEXT CHECK (pullup_type IN ('Overhand', 'Underhand'));

-- Update existing records to have a default pullup_type (you may want to set this manually)
UPDATE public.submissions 
SET pullup_type = 'Overhand' 
WHERE pullup_type IS NULL;

-- Make pullup_type NOT NULL after setting default values
ALTER TABLE public.submissions 
ALTER COLUMN pullup_type SET NOT NULL;

-- Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_submissions_pullup_type ON public.submissions(pullup_type);
CREATE INDEX IF NOT EXISTS idx_submissions_user_name ON public.submissions(user_name) WHERE user_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.submissions.user_name IS '用户名字或社媒账号（选填）';
COMMENT ON COLUMN public.submissions.video_url IS '训练视频链接（选填）';
COMMENT ON COLUMN public.submissions.pullup_type IS '引体向上类型：Overhand(正手) 或 Underhand(反手)';

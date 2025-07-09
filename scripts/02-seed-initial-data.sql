-- Insert initial formula coefficients (placeholder values)
-- These will be updated by the automated system once enough data is collected

INSERT INTO public.formulas (gender, coeff_a, coeff_b, coeff_c, coeff_d, coeff_e, coeff_f, total_submissions_used, last_updated)
VALUES 
    ('Male', 
     -2.5e-8,    -- coeff_a (W^5 term)
     8.2e-6,     -- coeff_b (W^4 term)
     -1.1e-3,    -- coeff_c (W^3 term)
     7.8e-2,     -- coeff_d (W^2 term)
     -2.8,       -- coeff_e (W term)
     45.5,       -- coeff_f (constant term)
     0,          -- total_submissions_used
     NOW()       -- last_updated
    ),
    ('Female',
     -1.8e-8,    -- coeff_a (W^5 term)
     6.1e-6,     -- coeff_b (W^4 term)
     -8.3e-4,    -- coeff_c (W^3 term)
     5.9e-2,     -- coeff_d (W^2 term)
     -2.1,       -- coeff_e (W term)
     38.2,       -- coeff_f (constant term)
     0,          -- total_submissions_used
     NOW()       -- last_updated
    )
ON CONFLICT (gender) DO UPDATE SET
    coeff_a = EXCLUDED.coeff_a,
    coeff_b = EXCLUDED.coeff_b,
    coeff_c = EXCLUDED.coeff_c,
    coeff_d = EXCLUDED.coeff_d,
    coeff_e = EXCLUDED.coeff_e,
    coeff_f = EXCLUDED.coeff_f,
    total_submissions_used = EXCLUDED.total_submissions_used,
    last_updated = EXCLUDED.last_updated;

-- Insert some sample data for testing
INSERT INTO public.submissions (gender, bodyweight, added_weight, reps, form_quality, penalty_weight, user_name, video_url, pullup_type)
VALUES 
    ('Male', 70.0, 0.0, 8, 'Good', 0, '张三', 'https://example.com/video1', 'Overhand'),
    ('Male', 75.5, 10.0, 5, 'Competition', 0, '@fitness_king', 'https://example.com/video2', 'Overhand'),
    ('Male', 68.2, 5.0, 12, 'Minor_Cheat', 3.0, NULL, NULL, 'Underhand'),
    ('Female', 55.0, 0.0, 6, 'Good', 0, '李四', 'https://example.com/video3', 'Overhand'),
    ('Female', 62.3, 5.0, 4, 'Competition', 0, '@strong_girl', NULL, 'Overhand'),
    ('Female', 58.7, 2.5, 10, 'Minor_Cheat', 2.5, NULL, 'https://example.com/video4', 'Underhand');

-- Insert initial formula coefficients (V0.1)
-- These coefficients are based on elite performance data

INSERT INTO public.formulas (gender, coeff_a, coeff_b, coeff_c, coeff_d, coeff_e, coeff_f, total_submissions_used, last_updated)
VALUES 
    ('Male', 
     0,              -- coeff_a (W^5 term) - not used in V0.1
     1.559673e-07,   -- coeff_b (W^4 term)
     -5.634172e-05,  -- coeff_c (W^3 term)
     7.929852e-03,   -- coeff_d (W^2 term)
     -0.532135,      -- coeff_e (W term)
     16.838986,      -- coeff_f (constant term)
     0,              -- total_submissions_used
     NOW()           -- last_updated
    ),
    ('Female',
     0,              -- coeff_a (W^5 term) - not used in V0.1
     3.995298e-07,   -- coeff_b (W^4 term)
     -1.252007e-04,  -- coeff_c (W^3 term)
     1.544642e-02,   -- coeff_d (W^2 term)
     -0.904901,      -- coeff_e (W term)
     25.002010,      -- coeff_f (constant term)
     0,              -- total_submissions_used
     NOW()           -- last_updated
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

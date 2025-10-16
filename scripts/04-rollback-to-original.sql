-- ============================================================================
-- 回滚脚本：恢复到原始数据库结构
-- 此脚本将撤销 03-update-schema.sql 中的所有更改
-- ============================================================================

-- 1. 删除新增的索引（如果存在）
DROP INDEX IF EXISTS idx_submissions_exercise_type;
DROP INDEX IF EXISTS idx_submissions_exercise_created;
DROP INDEX IF EXISTS idx_formulas_exercise_gender;

-- 2. 从 submissions 表中删除新增的列（如果存在）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'submissions' AND column_name = 'exercise_type') THEN
        ALTER TABLE public.submissions DROP COLUMN exercise_type;
    END IF;
END $$;

-- 3. 从 formulas 表中删除新增的列和约束（如果存在）
DO $$ 
BEGIN
    -- 删除新约束
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'formulas_gender_exercise_key') THEN
        ALTER TABLE public.formulas DROP CONSTRAINT formulas_gender_exercise_key;
    END IF;
    
    -- 删除新列
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'formulas' AND column_name = 'exercise_type') THEN
        ALTER TABLE public.formulas DROP COLUMN exercise_type;
    END IF;
    
    -- 恢复原来的唯一约束（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'formulas_gender_key') THEN
        ALTER TABLE public.formulas ADD CONSTRAINT formulas_gender_key UNIQUE(gender);
    END IF;
END $$;

-- 4. 删除新增的表（如果存在）
DROP TABLE IF EXISTS public.calculation_modes CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;

-- 完成回滚
-- 注意：此脚本不会删除已有的数据，只是移除新增的结构


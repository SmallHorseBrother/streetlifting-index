-- 扩展 submissions 表，添加 exercise_type 字段
-- 支持: weighted_pullup (负重引体), weighted_dips (负重双杠)

-- 1. 添加 exercise_type 列到 submissions 表
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS exercise_type TEXT NOT NULL DEFAULT 'weighted_pullup'
CHECK (exercise_type IN ('weighted_pullup', 'weighted_dips'));

-- 2. 添加 exercise_type 列到 formulas 表（为未来扩展预留）
ALTER TABLE public.formulas
ADD COLUMN IF NOT EXISTS exercise_type TEXT NOT NULL DEFAULT 'weighted_pullup';

-- 3. 删除旧的唯一约束并添加新的组合唯一约束
ALTER TABLE public.formulas DROP CONSTRAINT IF EXISTS formulas_gender_key;
ALTER TABLE public.formulas ADD CONSTRAINT formulas_gender_exercise_key UNIQUE(gender, exercise_type);

-- 4. 为新列创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_exercise_type ON public.submissions(exercise_type);
CREATE INDEX IF NOT EXISTS idx_formulas_exercise_type ON public.formulas(exercise_type);

-- 注意：DOTS 系数用于三大项（深蹲、卧推、硬拉）将在代码中硬编码
-- 因为这些是公开的标准系数，不需要存储在数据库中

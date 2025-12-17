-- ============================================
-- 社区数据增强 - 数据库迁移脚本
-- 执行时间: 2025-12-18
-- ============================================
-- 此脚本将:
-- 1. 确保 exercise_type 列存在
-- 2. 将所有现有数据标记为 weighted_pullup (负重引体)
-- 3. 添加必要的索引

-- ============================================
-- 第一步：添加 exercise_type 列（如果不存在）
-- ============================================
-- 注意：如果列已存在会跳过
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'weighted_pullup';

-- ============================================
-- 第二步：修复现有数据
-- 将所有 NULL 或空值的 exercise_type 更新为 weighted_pullup
-- 因为现有数据全部是负重引体
-- ============================================
UPDATE public.submissions 
SET exercise_type = 'weighted_pullup' 
WHERE exercise_type IS NULL OR exercise_type = '';

-- ============================================
-- 第三步：添加约束（确保只允许有效值）
-- ============================================
-- 先删除可能存在的旧约束
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_exercise_type_check;

-- 添加新约束
ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_exercise_type_check 
CHECK (exercise_type IN ('weighted_pullup', 'weighted_dips'));

-- ============================================
-- 第四步：设置非空约束和默认值
-- ============================================
ALTER TABLE public.submissions 
ALTER COLUMN exercise_type SET NOT NULL;

ALTER TABLE public.submissions 
ALTER COLUMN exercise_type SET DEFAULT 'weighted_pullup';

-- ============================================
-- 第五步：创建索引提高查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_submissions_exercise_type 
ON public.submissions(exercise_type);

-- ============================================
-- 验证：查看更新后的数据分布
-- ============================================
SELECT 
    exercise_type,
    COUNT(*) as count
FROM public.submissions 
GROUP BY exercise_type;

-- ============================================
-- 第六步：修改 pullup_type 列允许 NULL
-- 因为负重臂屈伸不需要此字段
-- ============================================

-- 删除 pullup_type 的 NOT NULL 约束
ALTER TABLE public.submissions 
ALTER COLUMN pullup_type DROP NOT NULL;

-- 删除旧的 check 约束（如果存在）
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_pullup_type_check;

-- 注意：pullup_type 仅对 weighted_pullup 有意义
-- weighted_dips 的 pullup_type 应为 NULL

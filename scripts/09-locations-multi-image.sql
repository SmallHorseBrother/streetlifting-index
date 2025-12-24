-- =============================================
-- 找单杠功能升级 - 多图片支持与编辑功能
-- =============================================

-- 1. 添加 image_urls 数组字段（最多4张图片）
alter table locations add column if not exists image_urls text[];

-- 2. 迁移现有 image_url 数据到 image_urls 数组
update locations 
set image_urls = array[image_url]
where image_url is not null 
  and image_url != ''
  and (image_urls is null or array_length(image_urls, 1) is null);

-- 3. 添加更新策略允许任何人编辑词条
create policy "Anyone can update locations"
  on locations for update
  with check ( true );

-- =============================================
-- 注意事项:
-- - 前端需要同时处理旧的 image_url 和新的 image_urls
-- - image_urls 数组最多存储4个图片URL
-- =============================================

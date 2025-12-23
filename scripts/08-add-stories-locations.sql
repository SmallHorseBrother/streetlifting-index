-- =============================================
-- 社区故事与单杠地图 - 数据库设置脚本
-- =============================================

-- 创建社区故事表
create table if not exists stories (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  video_url text, -- 可选视频链接（B站、抖音等）
  type text check (type in ('story', 'event')) default 'story',
  event_date date, -- 可选的事件日期
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_contact text -- 可选的提交者联系方式
);

-- 为故事表启用行级安全 (RLS)
alter table stories enable row level security;

-- 允许所有人查看故事
create policy "Public stories are viewable by everyone"
  on stories for select
  using ( true );

-- 允许任何人提交故事
create policy "Anyone can insert stories"
  on stories for insert
  with check ( true );

-- 初始化现有故事数据
insert into stories (title, video_url, type, event_date)
values 
  ('风吹裤管和小马哥冲突事件', 'https://www.wolai.com/fxoxabrZCusUeZY4h67uEF', 'event', '2024-01-01')
on conflict do nothing;

-- =============================================

-- 创建单杠地点表
create table if not exists locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  address text,
  city text,
  province text, -- 省份
  image_url text,
  latitude float, -- 可选经纬度
  longitude float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_contact text -- 提交者联系方式
);

-- 为地点表启用行级安全 (RLS)
alter table locations enable row level security;

-- 允许所有人查看地点
create policy "Public locations are viewable by everyone"
  on locations for select
  using ( true );

-- 允许任何人提交地点
create policy "Anyone can insert locations"
  on locations for insert
  with check ( true );

-- =============================================
-- 存储桶设置说明
-- =============================================
-- 请在 Supabase 控制台手动创建以下存储桶：
-- 1. 进入 Storage 页面
-- 2. 点击 "New Bucket"
-- 3. 名称：locations
-- 4. 类型：Public bucket (公开访问)
-- 5. 创建后，确保在 Policies 中允许公开上传和读取

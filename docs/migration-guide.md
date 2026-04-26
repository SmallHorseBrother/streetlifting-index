# Streetlifting-Index → CoachLink 迁移收尾操作指南

> 目标：把原站 2026-01-31 之后产生的新数据，完整迁移到 coachlink，然后安全关闭原站。

---

## 前置信息确认

| 项目 | 原站 (streetlifting-index) | 目标站 (coachlink) |
|------|---------------------------|-------------------|
| 数据库 URL | `https://chawreimucaalwgqdjra.supabase.co` | `https://uhlqribpagvklpqmcqvo.supabase.co` |
| submissions 表名 | `public.submissions` | `public.streetlifting_submissions` |
| locations 表名 | `public.locations` | `public.streetlifting_locations` |
| stories 表名 | `public.stories` | `public.streetlifting_stories` |
| formulas 表名 | `public.formulas` | `public.streetlifting_formulas` |
| 图片存储桶 | `locations` (public) | `streetlifting-locations` (public) |
| 图片域名 | `chawreimucaalwgqdjra.supabase.co` | `uhlqribpagvklpqmcqvo.supabase.co` |

---

## 第一步：数据导出（在原站数据库执行）

登录原站 Supabase Dashboard → SQL Editor → New query，依次执行以下 SQL。

### 1.1 导出 submissions（训练数据）

```sql
-- 导出 2026-01-31 00:00:00 UTC 之后的新数据
-- 结果复制保存为 submissions_migration.sql

SELECT
  id,
  created_at,
  gender,
  bodyweight,
  added_weight,
  reps,
  form_quality,
  penalty_weight,
  false AS is_processed,  -- coachlink 需要这个字段
  user_name,
  video_url,
  pullup_type,
  exercise_type
FROM public.submissions
WHERE created_at > '2026-01-31T00:00:00Z'
ORDER BY created_at ASC;
```

> **注意**：如果数据量很大，Supabase Dashboard 一次可能显示不完。建议：
> - 方法 A：在 SQL Editor 里执行后点击 "Download CSV"，然后写脚本转 SQL
> - 方法 B：用 Supabase CLI 直连导出：`npx supabase db dump --data-only ...`
> - 方法 C（推荐）：执行下面的 "生成 INSERT 脚本" SQL

#### 生成可直接执行的 INSERT 脚本（推荐）

```sql
-- 在原站 SQL Editor 执行，结果直接复制到 coachlink 执行
SELECT format(
  $$insert into public.streetlifting_submissions
    (id, created_at, gender, bodyweight, added_weight, reps, form_quality, penalty_weight, is_processed, user_name, video_url, pullup_type, exercise_type)
  values
  (%L, %L, %L, %s, %s, %s, %L, %s, false, %L, %L, %L, %L)
  on conflict (id) do update set
    created_at = excluded.created_at,
    gender = excluded.gender,
    bodyweight = excluded.bodyweight,
    added_weight = excluded.added_weight,
    reps = excluded.reps,
    form_quality = excluded.form_quality,
    penalty_weight = excluded.penalty_weight,
    user_name = excluded.user_name,
    video_url = excluded.video_url,
    pullup_type = excluded.pullup_type,
    exercise_type = excluded.exercise_type;$$,
  id,
  created_at,
  gender,
  bodyweight,
  added_weight,
  reps,
  form_quality,
  penalty_weight,
  user_name,
  video_url,
  pullup_type,
  exercise_type
) AS sql_statement
FROM public.submissions
WHERE created_at > '2026-01-31T00:00:00Z'
ORDER BY created_at ASC;
```

执行后，在 Results 标签页点击 "Copy"，把每一行的 `sql_statement` 复制下来，合并成一个 `.sql` 文件。

### 1.2 导出 locations（单杠位置）

```sql
-- 生成可直接执行的 INSERT 脚本
SELECT format(
  $$insert into public.streetlifting_locations
    (id, name, description, address, city, province, image_url, image_urls, latitude, longitude, created_at, user_contact)
  values
  (%L, %L, %L, %L, %L, %L, %L, %L, %s, %s, %L, %L)
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    address = excluded.address,
    city = excluded.city,
    province = excluded.province,
    image_url = excluded.image_url,
    image_urls = excluded.image_urls,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    created_at = excluded.created_at,
    user_contact = excluded.user_contact;$$,
  id,
  name,
  description,
  address,
  city,
  province,
  image_url,
  image_urls,
  latitude,
  longitude,
  created_at,
  user_contact
) AS sql_statement
FROM public.locations
WHERE created_at > '2026-01-31T00:00:00Z'
ORDER BY created_at ASC;
```

> **注意**：原站 `locations` 表的 `image_urls` 在旧版 schema 中可能是 `text[]` 或单列 `image_url`。coachlink 的 `streetlifting_locations` 同时支持两个字段，`image_urls` 是 `text[]`。如果原站数据结构不同，可能需要手动调整。

### 1.3 导出 stories（社区故事）

```sql
SELECT format(
  $$insert into public.streetlifting_stories
    (id, title, content, video_url, type, event_date, created_at, user_contact)
  values
  (%L, %L, %L, %L, %L, %L, %L, %L)
  on conflict (id) do update set
    title = excluded.title,
    content = excluded.content,
    video_url = excluded.video_url,
    type = excluded.type,
    event_date = excluded.event_date,
    created_at = excluded.created_at,
    user_contact = excluded.user_contact;$$,
  id,
  title,
  content,
  video_url,
  type,
  event_date,
  created_at,
  user_contact
) AS sql_statement
FROM public.stories
WHERE created_at > '2026-01-31T00:00:00Z'
ORDER BY created_at ASC;
```

### 1.4 同步 formulas（系数公式）

如果原站的 `formulas` 表在 1月31日之后有更新（比如 `last_updated` 字段变了），也需要同步：

```sql
-- 在原站执行，生成 INSERT 脚本
SELECT format(
  $$insert into public.streetlifting_formulas
    (gender, exercise_type, coeff_a, coeff_b, coeff_c, coeff_d, coeff_e, coeff_f, total_submissions_used, last_updated)
  values
  (%L, %L, %s, %s, %s, %s, %s, %s, %s, %L)
  on conflict (gender, exercise_type) do update set
    coeff_a = excluded.coeff_a,
    coeff_b = excluded.coeff_b,
    coeff_c = excluded.coeff_c,
    coeff_d = excluded.coeff_d,
    coeff_e = excluded.coeff_e,
    coeff_f = excluded.coeff_f,
    total_submissions_used = excluded.total_submissions_used,
    last_updated = excluded.last_updated;$$,
  gender,
  'weighted_pullup',  -- 原站 formulas 表没有 exercise_type 字段，默认按 weighted_pullup 处理
  coeff_a,
  coeff_b,
  coeff_c,
  coeff_d,
  coeff_e,
  coeff_f,
  total_submissions_used,
  last_updated
) AS sql_statement
FROM public.formulas
ORDER BY gender;
```

> 注意：原站 `formulas` 表按 `gender` 唯一；coachlink 按 `(gender, exercise_type)` 唯一。上面的脚本默认把原站公式映射为 `weighted_pullup`。如果原站也有臂屈伸的公式，需要确认。

---

## 第二步：数据导入（在 coachlink 数据库执行）

### 2.1 执行 SQL 脚本

登录 coachlink 的 Supabase Dashboard → SQL Editor → New query，把第一步生成的 `.sql` 文件内容粘贴进去执行。

**执行顺序建议**：
1. `formulas` 先执行（因为 submissions 计算依赖公式）
2. `submissions` 再执行
3. `locations` 再执行
4. `stories` 最后执行

### 2.2 验证导入结果

```sql
-- 验证 submissions 最新数据
SELECT COUNT(*) AS total_new_submissions,
       MAX(created_at) AS latest_submission
FROM public.streetlifting_submissions
WHERE created_at > '2026-01-31T00:00:00Z';

-- 验证 locations 最新数据
SELECT COUNT(*) AS total_new_locations,
       MAX(created_at) AS latest_location
FROM public.streetlifting_locations
WHERE created_at > '2026-01-31T00:00:00Z';

-- 验证 stories 最新数据
SELECT COUNT(*) AS total_new_stories,
       MAX(created_at) AS latest_story
FROM public.streetlifting_stories
WHERE created_at > '2026-01-31T00:00:00Z';
```

---

## 第三步：图片迁移

这是最容易被忽略但**最关键**的一步。原站关闭后，`chawreimucaalwgqdjra.supabase.co` 存储桶里的图片会 404。

### 3.1 方案选择

| 方案 | 复杂度 | 推荐度 | 说明 |
|------|--------|--------|------|
| **A. 批量下载+上传** | 中 | ⭐⭐⭐ 推荐 | 把图片从原站存储桶下载到本地，再上传到 coachlink 存储桶，最后批量更新数据库 URL |
| **B. 保持原站存储桶** | 低 | ⭐⭐ | 不迁移图片，但保持原站 Supabase 项目存活（只保留 Storage，关闭网站）。长期有隐患 |
| **C. 使用第三方图床** | 中 | ⭐ | 把图片传到第三方 CDN（如 Vercel Blob、腾讯云 COS），再更新 URL |

**推荐方案 A**，因为最彻底，原站可以完全关闭。

### 3.2 方案 A：批量下载+上传（详细步骤）

#### 步骤 A1：获取原站所有图片文件列表

登录原站 Supabase Dashboard → Storage → `locations` 桶 → `bar-images` 文件夹。

或者通过 SQL 查询数据库中引用的所有图片 URL：

```sql
-- 在原站执行：列出所有被引用的图片 URL
SELECT DISTINCT image_url FROM public.locations WHERE image_url IS NOT NULL
UNION
SELECT DISTINCT unnest(image_urls) FROM public.locations WHERE image_urls IS NOT NULL;
```

#### 步骤 A2：批量下载图片

在本地电脑上执行（需要 Node.js）：

```bash
# 1. 先安装 Supabase CLI 或直接写脚本
npm install @supabase/supabase-js axios fs-extra
```

创建一个下载脚本 `download-images.js`：

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://chawreimucaalwgqdjra.supabase.co',
  '你的-anon-key'
);

const BUCKET = 'locations';
const DOWNLOAD_DIR = './bar-images-download';

async function main() {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  // 列出存储桶中所有文件
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list('bar-images', { limit: 1000 });

  if (error) {
    console.error('列出文件失败:', error);
    return;
  }

  console.log(`共 ${files.length} 个文件`);

  for (const file of files) {
    const filePath = `bar-images/${file.name}`;
    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(filePath);

    if (downloadError) {
      console.error(`下载失败 ${file.name}:`, downloadError);
      continue;
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    fs.writeFileSync(path.join(DOWNLOAD_DIR, file.name), buffer);
    console.log(`✅ 已下载: ${file.name}`);
  }

  console.log('下载完成！');
}

main();
```

执行：
```bash
node download-images.js
```

#### 步骤 A3：批量上传到 coachlink 存储桶

创建上传脚本 `upload-images.js`：

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://uhlqribpagvklpqmcqvo.supabase.co',
  '你的-service-role-key'  // 注意：上传需要 service role key
);

const BUCKET = 'streetlifting-locations';
const UPLOAD_DIR = './bar-images-download';

async function main() {
  const files = fs.readdirSync(UPLOAD_DIR);
  console.log(`准备上传 ${files.length} 个文件`);

  for (const fileName of files) {
    const filePath = path.join(UPLOAD_DIR, fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = fileName.endsWith('.png') ? 'image/png' :
                        fileName.endsWith('.jpeg') || fileName.endsWith('.jpg') ? 'image/jpeg' :
                        'image/*';

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`bar-images/${fileName}`, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`❌ 上传失败 ${fileName}:`, error);
    } else {
      console.log(`✅ 已上传: ${fileName}`);
    }
  }

  console.log('上传完成！');
}

main();
```

执行：
```bash
node upload-images.js
```

#### 步骤 A4：批量更新数据库中的图片 URL

在 coachlink 数据库执行：

```sql
-- 更新 image_url 字段（单图）
UPDATE public.streetlifting_locations
SET image_url = REPLACE(image_url,
  'https://chawreimucaalwgqdjra.supabase.co/storage/v1/object/public/locations/',
  'https://uhlqribpagvklpqmcqvo.supabase.co/storage/v1/object/public/streetlifting-locations/'
)
WHERE image_url LIKE 'https://chawreimucaalwgqdjra.supabase.co%';

-- 更新 image_urls 数组字段（多图）
UPDATE public.streetlifting_locations
SET image_urls = ARRAY(
  SELECT REPLACE(url,
    'https://chawreimucaalwgqdjra.supabase.co/storage/v1/object/public/locations/',
    'https://uhlqribpagvklpqmcqvo.supabase.co/storage/v1/object/public/streetlifting-locations/'
  )
  FROM unnest(image_urls) AS url
)
WHERE image_urls IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(image_urls) AS url
    WHERE url LIKE 'https://chawreimucaalwgqdjra.supabase.co%'
  );
```

#### 步骤 A5：验证图片是否可访问

```sql
-- 检查是否还有残留的旧域名 URL
SELECT id, name, image_url
FROM public.streetlifting_locations
WHERE image_url LIKE 'https://chawreimucaalwgqdjra.supabase.co%'
LIMIT 10;

-- 检查 image_urls 数组中是否有旧域名
SELECT id, name, image_urls
FROM public.streetlifting_locations
WHERE image_urls IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(image_urls) AS url
    WHERE url LIKE 'https://chawreimucaalwgqdjra.supabase.co%'
  )
LIMIT 10;
```

打开几条记录的图片链接，确认能正常显示。

---

## 第四步：验证 coachlink 数据完整性

### 4.1 访问 coachlink 的街健模块检查

打开 `https://coachlink.fit/streetlifting-index/data`，确认：
- ✅ 最新的 submissions 数据已出现
- ✅ 力量分计算正常
- ✅ 排行榜排序正常

打开 `https://coachlink.fit/streetlifting-index/locations`，确认：
- ✅ 最新的单杠位置已出现
- ✅ 图片能正常加载

### 4.2 数据量对比

在 coachlink 数据库执行：

```sql
-- 总数据量统计
SELECT 'submissions' AS table_name, COUNT(*) AS total FROM public.streetlifting_submissions
UNION ALL
SELECT 'locations', COUNT(*) FROM public.streetlifting_locations
UNION ALL
SELECT 'stories', COUNT(*) FROM public.streetlifting_stories
UNION ALL
SELECT 'formulas', COUNT(*) FROM public.streetlifting_formulas;
```

对比原站的数据量（在原站执行）：

```sql
SELECT 'submissions' AS table_name, COUNT(*) AS total FROM public.submissions
UNION ALL
SELECT 'locations', COUNT(*) FROM public.locations
UNION ALL
SELECT 'stories', COUNT(*) FROM public.stories
UNION ALL
SELECT 'formulas', COUNT(*) FROM public.formulas;
```

**两个统计结果应该基本一致**（coachlink 的 submissions 会多一个 `user_id` 字段，但数量应该相同）。

---

## 第五步：安全关闭原站

### 5.1 关闭 Netlify 部署

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 找到 `streetlifting-index` 站点
3. 进入 Site settings → General → Delete site
   - 或者：停止自动部署（Build & deploy → Stop builds）

### 5.2 关闭原站 Supabase 项目（可选，谨慎操作）

> ⚠️ **如果第三步的图片迁移已经完成，原站 Supabase 项目可以安全删除。如果图片还没迁移完，先不要删！**

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard) → 项目 `chawreimucaalwgqdjra`
2. Project Settings → General → Delete project

### 5.3 清理环境变量

如果 `netlify.toml` 或 `.env.local` 中有原站的 Supabase 密钥，可以清理掉，避免泄露。

---

## 附录：常见问题

### Q1：数据量太大，SQL Editor 一次复制不完怎么办？

用 Supabase CLI 的 `psql` 直连导出：

```bash
# 获取连接字符串：Supabase Dashboard → Project Settings → Database → Connection string

# 导出 submissions
psql "postgres://postgres:密码@db.chawreimucaalwgqdjra.supabase.co:5432/postgres" \
  -c "\copy (SELECT * FROM public.submissions WHERE created_at > '2026-01-31T00:00:00Z') TO '/tmp/submissions.csv' WITH CSV HEADER"

# 然后用脚本把 CSV 转成 INSERT SQL，或者直接 COPY 导入 coachlink
```

### Q2：图片太多（几百张），手动下载太慢怎么办？

可以用 Supabase 的 `list()` API 分页获取，然后用 `Promise.all()` 并发下载/上传。

把上面的 `download-images.js` 改成并发模式：

```javascript
// 并发下载（每次 5 个）
const BATCH_SIZE = 5;
for (let i = 0; i < files.length; i += BATCH_SIZE) {
  const batch = files.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(file => downloadSingle(file)));
}
```

### Q3：原站的 `submissions` 表中有 `is_processed` 字段，coachlink 也有，但原站的一直是 false，有影响吗？

没有影响。`is_processed` 在 coachlink 中用于标记"是否已纳入公式计算"。历史数据迁移过来设为 `false` 是合理的，后续批量计算时会统一处理。

### Q4：如果我不熟悉 Supabase CLI，有没有更简单的方法？

有。最简单的方式是：
1. 在原站 SQL Editor 里执行导出 SQL
2. 结果用 CSV 格式下载
3. 用 [DBeaver](https://dbeaver.io/) 或 [TablePlus](https://tableplus.com/) 同时连接两个数据库
4. 直接复制粘贴数据行

---

## 检查清单（Checklist）

迁移完成后逐项打勾：

- [ ] 第一步：submissions 新数据已导出
- [ ] 第一步：locations 新数据已导出
- [ ] 第一步：stories 新数据已导出
- [ ] 第一步：formulas 已同步
- [ ] 第二步：SQL 脚本已在 coachlink 执行成功
- [ ] 第二步：导入后数据量与原站一致
- [ ] 第三步：所有图片已从原站下载
- [ ] 第三步：所有图片已上传到 coachlink 存储桶
- [ ] 第三步：数据库中的图片 URL 已批量替换
- [ ] 第三步：随机抽查 5 个位置，图片能正常显示
- [ ] 第四步：coachlink 网页端数据展示正常
- [ ] 第四步：coachlink 小程序端数据展示正常
- [ ] 第五步：原站 Netlify 部署已关闭
- [ ] 第五步：原站域名已做 301 跳转（可选，建议跳转到 coachlink.fit/streetlifting-index）

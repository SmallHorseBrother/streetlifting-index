# Supabase project requirements

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/smallhorsebrothers-projects/v0-supabase-project-requirements)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/YhxGYJYx3aQ)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/smallhorsebrothers-projects/v0-supabase-project-requirements](https://vercel.com/smallhorsebrothers-projects/v0-supabase-project-requirements)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/YhxGYJYx3aQ](https://v0.dev/chat/projects/YhxGYJYx3aQ)**

## 本地开发

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

> 如使用 pnpm，请先升级到支持 lockfileVersion 9 的版本后执行 `pnpm install`。

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的 Supabase 项目凭证：

- `NEXT_PUBLIC_SUPABASE_URL`：在 [Supabase Dashboard](https://supabase.com/dashboard) 创建项目后获取
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：同上获取 anon/public key

### 3. 初始化数据库

在 Supabase SQL Editor 中依次执行 `scripts/` 目录下的 SQL 脚本（01-create-tables.sql 等）。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

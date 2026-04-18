# Study Kanban

一个本地优先的备考看板，用来管理 CET-6 和初级会计的每日任务、日历打卡、备考资源和知识点 SOP。

## 本地打开

直接打开 `index.html` 即可使用。

## 部署到 Vercel

把本目录推到 GitHub 后，在 Vercel 导入仓库即可。项目是纯静态页面，不需要构建命令。

推荐设置：

- Framework Preset: Other
- Build Command: 留空
- Output Directory: 留空

## 数据

当前数据默认保存在浏览器 `localStorage`：

- `checks_*`: 每日打卡
- `prep_*`: 考试准备大合集编辑内容

配置 Supabase 后，可以把这些 key-value 数据同步到云端。

## Supabase

1. 在 Supabase 创建项目。
2. 打开 SQL Editor，执行 `supabase.sql`。
3. 在 Authentication 的 URL Configuration 里加入站点地址：
   - `https://study-kanban.vercel.app`
   - 本地测试时也可加入 `http://localhost:3000`
4. 在 Project Settings / API 里复制：
   - Project URL
   - anon / publishable key
5. 填入 `app.js` 顶部的 `SUPABASE_CONFIG`。

不要把 `service_role` key 放进前端代码。

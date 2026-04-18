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

当前数据保存在浏览器 `localStorage`：

- `checks_*`: 每日打卡
- `prep_*`: 考试准备大合集编辑内容

后续接 Supabase 时，可以把这些 key-value 数据同步到云端。

# Study Kanban

一个本地优先、可云端同步的备考看板，用来管理 CET-6 和初级会计的每日任务、日历补打、复盘资料、考试策略和知识点 SOP。

线上地址：https://study-kanban.vercel.app/

## 功能

- CET-6 与初级会计两套备考计划
- 今日打卡、任务提醒、实时小数倒计时
- 日历视图，支持点击任意日期补打或修改打卡
- 清单、策略、资源入口和考试准备大合集
- 自动保存编辑框内容
- 浅色、深色、跟随系统三种主题
- Supabase Auth 登录与云端同步
- 离线模式，仅使用当前浏览器 localStorage
- 云端冲突处理：保留本机、保留云端、合并
- 关于页与内置更新记录

## 本地打开

这是纯静态项目，直接打开 `index.html` 即可使用。

如果浏览器限制本地模块或你想模拟线上环境，可以在项目目录启动一个静态服务，例如：

```bash
python -m http.server 3000
```

然后访问：

```text
http://localhost:3000
```

## 部署到 Vercel

把本目录推到 GitHub 后，在 Vercel 导入仓库即可。

推荐设置：

- Framework Preset: Other
- Build Command: 留空
- Output Directory: 留空

## 数据结构

默认数据保存在浏览器 `localStorage`：

- `checks_*`: 每日打卡记录
- `prep_*`: 考试准备大合集内容
- `exam_time_*`: 每个考试的自定义考试时间
- `active_exam`: 当前选中的考试
- `theme`: 主题设置

登录后会同步到 Supabase 的 `study_store` 表。表结构见 `supabase.sql`。

## Supabase 配置

1. 在 Supabase 创建项目。
2. 打开 SQL Editor，执行 `supabase.sql`。
3. 在 Authentication / URL Configuration 里添加站点地址：
   - `https://study-kanban.vercel.app`
   - 本地测试可加 `http://localhost:3000`
4. 在 Project Settings / API 里复制：
   - Project URL
   - publishable / anon key
5. 填入 `app.js` 顶部的 `SUPABASE_CONFIG`。

不要把 `service_role` key 放进前端代码。

## 发版记录

应用内“关于”页会从 `app.js` 顶部的 `CHANGELOG` 自动渲染更新记录。每次更新时：

1. 修改功能代码。
2. 在 `CHANGELOG` 最上方加一条版本记录。
3. 同步更新 `APP_INFO.version` 和 `APP_INFO.releaseDate`。
4. 提交并 push 到 GitHub。
5. 需要正式版本时，在 GitHub 创建 release。

## 当前版本

`v0.4.0`


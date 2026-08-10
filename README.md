# RIKKAzzz // Personal Reality

RIKKAzzz 的沉浸式个人网站，以 2010 年代日系未来操作系统、SAO Utility UI 与赛博朋克 HUD 为主要视觉方向。

## 网站内容

- “越过现实边界”启动界面与高清开屏动画
- 亮色 / 暗色世界主题与界面音效
- 访问者身份确认和本地会话用户名
- 天空之城虚拟桌面与实时浏览器性能 HUD
- Bilibili 作品档案与视频浮窗
- AE、Blender、ComfyUI、AI Agent 等个人技能介绍
- X、Gmail、QQ 与 GitHub 联系方式
- 桌面端和移动端响应式布局

## 本地预览

建议通过本地 HTTP 服务预览：

```powershell
cd E:\codex
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 文件结构

```text
E:\codex
├─ index.html
├─ styles.css
├─ app.js
├─ assets\
│  ├─ intro-1222-h264.mp4
│  ├─ audio\
│  ├─ avatar-rikkazzz.png
│  ├─ world-background.jpg
│  ├─ world-background-dark.png
│  └─ video-*.*
├─ sd\
└─ source-files\     # 本地源素材，不上传到仓库
```

## 部署

这是一个无框架、无服务端依赖的静态网站，可直接部署到 Cloudflare Pages：

```text
Production branch: main
Build command: exit 0
Build output directory: .
```

访客名称仅保存在浏览器 `sessionStorage` 中，不会发送到服务器。

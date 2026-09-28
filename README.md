# RIKKAzzz // Personal Reality

> Anime-inspired immersive portfolio built with vanilla HTML, CSS and JavaScript.

[在线体验](https://rikkazzz.com)

**Personal Reality** 是一个浏览器原生的沉浸式个人作品集，也是一次创意前端实验。项目借鉴 2010 年代日系动画对虚拟现实操作系统的想象，将启动协议、身份认证、空间化 HUD、实时浏览器遥测和作品档案串联成完整的交互叙事。
<img width="2533" height="1301" alt="image" src="https://github.com/user-attachments/assets/f2bab1d9-06b9-4099-8096-f83c42b54686" />
<img width="2537" height="1299" alt="image" src="https://github.com/user-attachments/assets/f768763d-a199-4319-9eb2-65123673979f" />

## 项目定位

这个项目不是传统简历模板，也不是对某个动画界面的静态复刻。它的定位是：

**以动漫 VR 操作系统为视觉语言、以个人作品展示为内容核心的轻量级沉浸式 Web 体验。**

它位于常规作品集网站与重型 WebGL 交互作品之间：保留空间感、系统感和视听反馈，同时使用原生 Web 技术控制加载成本、兼容性与移动端性能。

## 核心优势

### 1. 完整的叙事式交互流程

桌面端由多个状态明确的场景组成：启动界面 → 开屏动画 → 访客身份连接 → 个人虚拟桌面。场景之间共享主题、声音和身份状态，形成连续的“进入世界”体验。手机端跳过开屏视频，直接进入身份连接，减少加载与解码开销。

### 2. 无框架实现空间化 HUD

项目没有引入前端框架或 3D 引擎，通过 CSS 3D Transform、透视、`clip-path`、SVG 路径、分层位移和克制的玻璃材质构建空间界面。相比完整 WebGL 场景，它更轻、更容易维护，也更适合静态托管。

### 3. 展示真实浏览器遥测，而非伪造硬件占用率

桌面身份连接场景的 HUD 会读取 FPS、帧时间、会话时长、逻辑核心数、设备内存、屏幕与视口、浏览器、平台、网络下行与 RTT，以及 WebGL / WebGPU 能力。浏览器不支持的项目会显示 `N/A`，不会用演示数字冒充真实 CPU、GPU 或 RAM 使用率。采样仅在相关场景可见时运行，手机端关闭持续的渲染遥测采样。

### 4. 以视频帧为基准的音画启动系统

开屏视频与独立音轨按用户手势启动，并在支持的浏览器中使用 `requestVideoFrameCallback()` 等待首个真实视频帧后再进入音频流程，减少首次访问时的音画错位。场景切换、浮窗入场和交互反馈使用统一的界面音效系统。

### 5. 桌面与移动端采用不同性能层级

桌面端提供“自动 / 完整 / 平衡 / 节能”画质。自动模式依据稳定场景的帧间隔检测持续卡顿，连续两个慢速采样窗口后才降一级，手动选择优先。大面板使用缓存玻璃纹理，主题或尺寸变化后更新；弹窗后方和滚出视野的卡片暂停装饰动画。

手机端使用可拖动的大场景，保留导航、主内容和资料卡之间的位置关系。默认关闭开场视频、粒子、漂浮、扫光、鼠标视差和实时模糊，保留昼夜背景、缓存玻璃、头像及静态霓虹轮廓。手机轻量设置不覆盖保存的桌面画质偏好，项目也尊重 `prefers-reduced-motion`。

### 6. 渐进加载与隐私友好的本地状态

开屏媒体按需加载，作品封面使用 WebP 与懒加载，离开场景后会释放不再需要的媒体资源。访客名称与当前进度只保存在 `sessionStorage`，遥测数据只用于当前页面显示，不上传到服务器。

## 技术实现

| 模块 | 实现方式 |
| --- | --- |
| 项目架构 | 原生 HTML5、CSS3、JavaScript；无框架、无构建步骤、无服务端依赖 |
| 场景系统 | `data-scene`、状态类、`hidden`、`inert` 与 ARIA 属性共同管理可见性和交互焦点 |
| 空间视觉 | CSS Perspective / 3D Transform、原生 Web Animations、`clip-path`、SVG Path、缓存玻璃和鼠标视差 |
| 视听系统 | HTML5 Video / Audio、首帧同步、播放漂移修正、按需加载与资源释放 |
| 实时遥测 | Performance API、Network Information API、Navigator API、Canvas、WebGL / WebGPU 能力检测 |
| 响应式策略 | `matchMedia()`、动态视口单位、安全区适配、手机原生拖动场景、独立缩放与轻量显示 |
| 作品展示 | 数据分组的 Bilibili 视频浮窗、WebP 封面懒加载、键盘与焦点管理 |
| 本地状态 | `sessionStorage` 保存访客名称和单次会话进度，`localStorage` 保存主题、音效和画质偏好；不上传遥测或访客状态 |

## 主要交互模块

- 协议启动页与全屏开屏影像
- 亮色 / 暗色世界主题及统一音效控制
- 访客身份确认、会话恢复与欢迎流程
- 空间化个人桌面、自由分布的 HUD Widget 和视差反馈
- 实时渲染性能、网络、设备能力与会话状态面板
- 影像作品分类、Bilibili 封面浮窗与外部播放跳转
- 个人技能、项目方向和身份信息视图
- 桌面端自适应画质与手机端可拖动的轻量大场景

## 手机浏览

竖屏下左右或上下拖动场景，可以查看左侧导航、主面板和右侧资料卡。底部小地图显示当前位置，`− / +` 调整场景缩放；“总览”查看完整构图，“主体”返回主要内容，“资料”跳到个人资料卡。登录阶段的侧边快捷入口为“状态”。

长内容在面板内独立滚动，作品弹窗按屏幕尺寸显示，关闭后回到原浏览位置。场景缩放使用底部按钮，浏览器原生双指页面缩放仍可使用。

手机场景适用于宽度不超过 720 CSS 像素的窗口，或宽度不超过 1180 CSS 像素且主要指针为触摸的设备；横屏后也保留拖动和缩放。

## 相关项目与定位差异

| 类型 / 代表项目 | 主要方向 | Personal Reality 的差异 |
| --- | --- | --- |
| [SAO Utils](https://github.com/NERvGear/SAO-Utils) | 桌面端启动器、Widget 与系统覆盖层 | 将相近的未来操作系统语言转化为无需安装的浏览器个人作品集 |
| [SAO UI Plan](https://cloud.tencent.com/developer/article/1834116) 等网页组件 | SAO 风格菜单、按钮或局部交互复刻 | 提供从启动、身份连接到内容桌面的完整多场景体验 |
| [Portfolio Responsive Complete](https://github.com/bedimcode/portfolio-responsive-complete) 等作品集模板 | 以滚动页面、内容区块和响应式布局为主 | 以体验叙事、空间 HUD 和实时系统反馈为核心 |
| [Bruno Simon Portfolio](https://bruno-simon.com/) 等 WebGL 作品集 | 真实 3D 世界与游戏化导航 | 使用 CSS 空间效果与原生 JavaScript，在表现力、加载成本和移动端兼容之间取平衡 |

因此，本项目更接近一个 **anime-inspired immersive portfolio / browser-native HUD experiment**，而不是传统 Dashboard、单一 UI 组件库或完整 3D 游戏。

## 项目结构

```text
rikkazzz-personal-site/
├─ index.html                 # 页面结构与场景内容
├─ styles.css                # 主题、空间 HUD、动画与响应式策略
├─ app.js                    # 场景状态、媒体同步、遥测与交互逻辑
├─ performance.js            # 缓存玻璃、自适应画质、遮挡和离屏暂停
├─ mobile.js                 # 手机场景拖动、缩放、定位与小地图
├─ mobile.css                # 手机大场景布局及静态轻量显示
└─ assets\
   ├─ audio\                 # 开屏音轨与界面反馈音效
   ├─ intro-1222-h264.mp4    # 开屏视频
   ├─ world-background.*     # 亮色 / 暗色世界背景
   ├─ avatar-rikkazzz.*      # 个人头像
   └─ video-*.webp           # 作品封面
```

## 本地运行

项目可以直接打开，但通过本地 HTTP 服务预览能获得更稳定的媒体加载行为：

```powershell
cd .\rikkazzz-personal-site
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 性能与验证

已通过桌面浏览器回归和手机尺寸模拟，覆盖首次登录、主题切换、导航、作品弹窗、触摸拖动误触防护、长内容滚动、缩放及横竖屏切换。手机主页静置时没有持续运行的 CSS／原生动画；拖动、缩放与切换内容仍会产生渲染开销。自动画质依据帧间隔，不能读取设备的真实 GPU 占用率。

目前手机测试基于 Edge 触控与视口模拟，尚未完成真实 Android／iPhone 的性能验证。

## 说明

这是一个非官方的个人设计与技术实验，与《刀剑神域》及其权利方不存在关联或授权关系。项目中提及的作品、名称与商标归各自权利方所有。

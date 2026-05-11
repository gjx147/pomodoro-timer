# Pomodoro Timer

一款精致的番茄钟桌面应用，帮助你在工作与游戏之间保持节奏。

![Electron](https://img.shields.io/badge/Electron-28-47848F?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.1-4CAF50?style=flat-square)

![screenshot](https://raw.githubusercontent.com/gjx147/pomodoro-timer/master/screenshot.png)

## 特性

**番茄模式** — 25 分钟专注 / 5 分钟短休息 / 每 4 个番茄后 15 分钟长休息，进度环随状态自动变色。

**游戏模式** — 40 分钟游戏 / 10 分钟休息，独立计数。

**精确计时** — 基于 `Date.now()` 的时间戳校准，即使系统繁忙或窗口最小化，计时也不会漂移。

**状态颜色** — 工作（绿）、短休息（蓝）、长休息（紫）、游戏（橙）、游戏休息（青），一眼区分当前阶段。

**键盘快捷键** — `Space` 开始/暂停、`R` 重置、`S` 跳过、`1` / `2` 切换模式。

**更多** — 浅色/深色主题、窗口置顶、最小化到托盘、桌面通知、声音提醒。

## 下载

前往 [Releases](https://github.com/gjx147/pomodoro-timer/releases/latest) 下载最新版本：

| 文件 | 说明 |
|------|------|
| `pomodoro-timer-1.0.1 Setup.exe` | 安装包（推荐） |
| `pomodoro-timer-win32-x64-1.0.1.zip` | 便携版，解压即用 |

## 开发

```bash
npm install      # 安装依赖
npm start        # 运行
npm run make     # 打包
```

## 技术栈

Electron · Vanilla JS · CSS Variables · SVG Progress Ring

## License

MIT

---

powered by 郭建巡

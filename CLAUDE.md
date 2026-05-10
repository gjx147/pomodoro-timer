# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

番茄钟桌面应用 (Electron)，支持番茄模式和游戏模式两种计时。

## 构建命令

```bash
npm install        # 安装依赖
npm start          # 开发模式运行
npm run make       # 打包 (electron-forge)
```

## 手动构建 NSIS 安装包

```bash
makensis installer.nsi
```

输出: `release/pomodoro-timer-setup.exe`

## 架构

```
main.js          # Electron 主进程：窗口管理、托盘、IPC 处理器
preload.js       # 上下文桥接：暴露 showNotification, setAlwaysOnTop
renderer.js      # 渲染进程：计时器逻辑、状态管理、UI 更新
index.html       # 页面结构
styles.css       # 样式（含浅色/深色主题）
installer.nsi    # NSIS 安装脚本
```

### 状态设计

- `currentMode`: `pomodoro` | `game`
- `currentState`: `work` | `short_break` | `long_break`
- `timeRemaining` / `totalTime`: 缓存 totalTime 避免每 tick 计算
- `pomodoroCount`: 完成番茄数，每 4 个触发长休息

### IPC 通信

主进程 → 渲染：`electronAPI.showNotification(title, body)`
主进程 → 渲染：`electronAPI.setAlwaysOnTop(flag)`

## 已知修复

`transitionToBreak()` 中 `LONG_BREAK` 状态计算有误（已修复）：必须先计算 `isLongBreak` 再赋值 `currentState`，而非先设置为 `SHORT_BREAK` 后检查。

## GitHub Releases

使用 NSIS 打包安装包，icon.ico 需存在于项目根目录。便携版用 PowerShell 的 `ZipFile.CreateFromDirectory` 制作。
# 番茄钟桌面应用

一个简洁高效的番茄工作法计时器，支持番茄模式和游戏模式。

![Pomodoro Timer](https://img.shields.io/badge/Pomodoro-Timer-4CAF50?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 功能特点

### 番茄模式
- 25分钟专注工作
- 5分钟短休息
- 每4个番茄后15分钟长休息
- 番茄计数显示

### 游戏模式
- 40分钟游戏计时
- 10分钟休息
- 按次计数

### 其他功能
- 桌面通知提醒
- 声音提醒
- 主题切换（浅色/深色）
- 窗口置顶
- 最小化到系统托盘
- 右键托盘菜单（显示/退出）

## 界面预览

![番茄钟界面](https://raw.githubusercontent.com/gjx147/pomodoro-timer/master/screenshot.png)

## 下载安装

直接从 [GitHub Releases](https://github.com/gjx147/pomodoro-timer/releases/latest) 下载：

| 文件 | 说明 |
|------|------|
| `pomodoro-timer-setup.exe` | NSIS 安装包 (推荐) |
| `pomodoro-timer-portable.zip` | 便携版，解压即用 |

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm start

# 打包 (electron-forge)
npm run make

# 或使用 NSIS 手动打包
makensis installer.nsi
```

## 技术栈

- **框架**: Electron
- **构建工具**: electron-forge + NSIS

## 项目结构

```
pomodoro-timer/
├── main.js          # 主进程
├── preload.js       # 预加载脚本
├── renderer.js      # 渲染进程逻辑
├── index.html       # 主页面
├── styles.css       # 样式文件
├── package.json     # 项目配置
├── installer.nsi    # NSIS 安装脚本
└── SPEC.md          # 功能规格说明
```

## 使用说明

1. **开始计时**: 点击"开始"按钮
2. **暂停**: 点击"暂停"按钮暂停计时
3. **重置**: 点击"重置"回到当前模式初始时间
4. **跳过**: 点击"跳过"直接进入下一个阶段
5. **切换模式**: 点击"番茄模式"或"游戏模式"切换
6. **主题切换**: 点击右上角设置按钮，选择主题

## 作者

powered by 郭建巡

## License

MIT
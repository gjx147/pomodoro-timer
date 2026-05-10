// ============================================
// 番茄钟桌面应用 - 主进程
// ============================================

const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');

// 主窗口实例
let mainWindow = null;
// 系统托盘实例
let tray = null;
// 是否正在退出（防止关闭时最小化到托盘）
let isQuitting = false;

// ============================================
// 窗口创建
// ============================================

/**
 * 创建主窗口
 * 设置窗口大小、属性，加载HTML文件
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 600,
    resizable: true,
    minWidth: 400,
    minHeight: 500,
    autoResize: true,           // 固定窗口大小
    center: true,                // 屏幕中央显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // 加载主页面
  mainWindow.loadFile('index.html');

  // 拦截关闭事件，最小化到托盘而非退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 窗口关闭时清空引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================
// 系统托盘
// ============================================

/**
 * 创建系统托盘
 * 设置托盘图标、上下文菜单、点击行为
 */
function createTray() {
  // 加载应用图标
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    // 图标为空时使用空白图标
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  // 创建右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => mainWindow.show()
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('番茄钟');
  tray.setContextMenu(contextMenu);

  // 单击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow.show();
  });
}

// ============================================
// 应用生命周期
// ============================================

// 应用就绪后创建窗口和托盘
app.whenReady().then(() => {
  createWindow();
  createTray();
});

// 所有窗口关闭时退出（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS点击dock图标重新创建窗口
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ============================================
// IPC通信处理
// ============================================

// 显示桌面通知
ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

// 设置窗口置顶
ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
});
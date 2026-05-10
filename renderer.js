// ============================================
// 番茄钟桌面应用 - 渲染进程脚本
// ============================================

// 番茄模式时间设置（单位：秒）
const WORK_TIME = 25 * 60;           // 专注工作时间：25分钟
const SHORT_BREAK_TIME = 5 * 60;     // 短休息时间：5分钟
const LONG_BREAK_TIME = 15 * 60;     // 长休息时间：15分钟
const POMODOROS_FOR_LONG_BREAK = 4;  // 触发长休息的番茄数量

// 游戏模式时间设置（单位：秒）
const GAME_WORK_TIME = 40 * 60;      // 游戏工作时间：40分钟
const GAME_BREAK_TIME = 10 * 60;     // 游戏休息时间：10分钟

// 状态枚举：工作/短休息/长休息
const STATE = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break'
};

// 模式枚举：番茄模式/游戏模式
const MODE = {
  POMODORO: 'pomodoro',
  GAME: 'game'
};

// 状态显示标签
const LABELS = {
  POMODORO_WORK: '专注时间',
  POMODORO_SHORT: '短休息',
  POMODORO_LONG: '长休息',
  GAME_WORK: '游戏时间',
  GAME_BREAK: '游戏休息'
};

// ============================================
// 状态变量
// ============================================
let currentMode = MODE.POMODORO;     // 当前模式（默认番茄模式）
let currentState = STATE.WORK;       // 当前状态（默认工作）
let timeRemaining = WORK_TIME;       // 剩余时间（秒）
let isRunning = false;               // 计时器是否运行中
let pomodoroCount = 0;               // 完成的番茄数量
let timerInterval = null;            // 计时器间隔ID
let soundEnabled = true;            // 声音提醒开关

// ============================================
// DOM 元素引用
// ============================================
const minutesEl = document.getElementById('minutes');       // 分钟显示元素
const secondsEl = document.getElementById('seconds');       // 秒钟显示元素
const timerLabel = document.getElementById('timerLabel');   // 状态标签（专注时间/休息等）
const timerProgress = document.getElementById('timerProgress'); // 进度圆环
const startBtn = document.getElementById('startBtn');       // 开始/暂停按钮
const resetBtn = document.getElementById('resetBtn');       // 重置按钮
const skipBtn = document.getElementById('skipBtn');         // 跳过按钮
const pomodoroDots = document.getElementById('pomodoroDots'); // 番茄计数圆点容器
const settingsBtn = document.getElementById('settingsBtn'); // 设置按钮
const settingsPanel = document.getElementById('settingsPanel'); // 设置面板
const closeSettings = document.getElementById('closeSettings'); // 关闭设置按钮
const themeSelect = document.getElementById('themeSelect'); // 主题选择器
const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop'); // 置顶复选框
const soundCheckbox = document.getElementById('soundEnabled'); // 声音复选框
const alarmSound = document.getElementById('alarmSound');   // 闹铃音频
const pomodoroModeBtn = document.getElementById('pomodoroMode'); // 番茄模式按钮
const gameModeBtn = document.getElementById('gameMode');    // 游戏模式按钮

// 进度圆环周长（半径90）
const CIRCUMFERENCE = 2 * Math.PI * 90;
timerProgress.style.strokeDasharray = CIRCUMFERENCE;

// ============================================
// 核心功能函数
// ============================================

/**
 * 获取当前状态的总时间
 * 根据模式和状态返回对应的计时时长
 */
function getTotalTime() {
  if (currentMode === MODE.GAME) {
    return currentState === STATE.WORK ? GAME_WORK_TIME : GAME_BREAK_TIME;
  }
  return currentState === STATE.WORK ? WORK_TIME :
         currentState === STATE.SHORT_BREAK ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
}

/**
 * 获取当前状态的显示标签
 * 根据模式和状态返回对应的中文标签
 */
function getStateLabel() {
  if (currentMode === MODE.GAME) {
    return currentState === STATE.WORK ? LABELS.GAME_WORK : LABELS.GAME_BREAK;
  }
  return currentState === STATE.WORK ? LABELS.POMODORO_WORK :
         currentState === STATE.SHORT_BREAK ? LABELS.POMODORO_SHORT : LABELS.POMODORO_LONG;
}

/**
 * 刷新UI：更新状态标签和计时器显示
 * 用于状态切换后统一刷新界面
 */
function refreshUI() {
  timerLabel.textContent = getStateLabel();
  updateDisplay();
}

/**
 * 更新计时器显示
 * 更新分钟和秒钟的文本，以及进度圆环
 */
function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  minutesEl.textContent = minutes.toString().padStart(2, '0');
  secondsEl.textContent = seconds.toString().padStart(2, '0');
  // 更新进度圆环偏移量
  timerProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - (timeRemaining / getTotalTime()));
}

/**
 * 更新番茄计数圆点
 * 游戏模式下不显示圆点，番茄模式下根据完成数量填充
 */
function updatePomodoroDots() {
  // 游戏模式：清除所有圆点
  if (currentMode === MODE.GAME) {
    pomodoroDots.querySelectorAll('.dot').forEach(dot => dot.classList.remove('filled'));
    return;
  }
  // 番茄模式：根据计数填充圆点（每4个一组循环）
  pomodoroDots.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < pomodoroCount % 4);
  });
}

/**
 * 播放闹铃声音
 * 仅在声音开关开启时播放
 */
function playSound() {
  if (!soundEnabled) return;
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {});
}

/**
 * 显示桌面通知
 * 通知内容根据当前模式和状态动态生成
 */
function showNotification() {
  const isWork = currentState === STATE.WORK;
  const modeLabel = currentMode === MODE.GAME ? '游戏' : '专注';
  window.electronAPI.showNotification(
    isWork ? `${modeLabel}结束！` : '休息结束！',
    isWork ? '该休息一下了' : `继续${currentMode === MODE.GAME ? '游戏' : '专注工作'}吧`
  );
}

/**
 * 切换到休息状态
 * 根据当前模式和时间决定是短休息还是长休息
 */
function transitionToBreak() {
  currentState = STATE.SHORT_BREAK;
  // 游戏模式使用游戏休息时间
  // 番茄模式：每4个番茄后长休息，否则短休息
  timeRemaining = currentMode === MODE.GAME ? GAME_BREAK_TIME :
                   pomodoroCount % POMODOROS_FOR_LONG_BREAK === 0 ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
  if (currentState === STATE.LONG_BREAK) currentState = STATE.LONG_BREAK;
}

/**
 * 切换工作/休息状态
 * 工作结束时进入休息，休息结束时进入工作
 */
function switchState() {
  // 如果当前不是工作状态，说明在休息中，切换回工作
  if (currentState !== STATE.WORK) {
    currentState = STATE.WORK;
    timeRemaining = currentMode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
    refreshUI();
    return;
  }

  // 工作状态结束：番茄模式计数+1，然后进入休息
  if (currentMode === MODE.POMODORO) {
    pomodoroCount++;
    updatePomodoroDots();
  }

  transitionToBreak();
  refreshUI();
}

/**
 * 计时器滴答回调
 * 每秒调用一次，减少剩余时间并更新显示
 * 时间到时：停止计时、播放声音、弹出通知、切换状态
 */
function tick() {
  if (timeRemaining > 0) {
    timeRemaining--;
    updateDisplay();
  } else {
    stopTimer();
    playSound();
    showNotification();
    switchState();
  }
}

// ============================================
// 计时器控制函数
// ============================================

/**
 * 开始计时
 * 设置运行状态，更新按钮文字，启动定时器
 */
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.textContent = '暂停';
  startBtn.classList.add('paused');
  timerInterval = setInterval(tick, 1000);
}

/**
 * 停止计时
 * 清除运行状态和定时器，更新按钮文字
 */
function stopTimer() {
  isRunning = false;
  startBtn.textContent = '开始';
  startBtn.classList.remove('paused');
  clearInterval(timerInterval);
  timerInterval = null;
}

/**
 * 重置计时器
 * 停止计时，恢复到当前模式的初始状态
 */
function reset() {
  stopTimer();
  currentState = STATE.WORK;
  timeRemaining = currentMode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
  refreshUI();
}

/**
 * 跳过当前阶段
 * 停止计时并直接切换到下一个状态
 */
function skip() {
  stopTimer();
  switchState();
}

// ============================================
// 模式切换
// ============================================

/**
 * 切换应用模式（番茄模式/游戏模式）
 * 重置所有状态到新模式的初始值
 */
function switchMode(mode) {
  if (mode === currentMode) return;
  stopTimer();
  currentMode = mode;
  currentState = STATE.WORK;
  pomodoroCount = 0;
  timeRemaining = mode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
  // 更新模式按钮的激活状态
  pomodoroModeBtn.classList.toggle('active', mode === MODE.POMODORO);
  gameModeBtn.classList.toggle('active', mode === MODE.GAME);
  refreshUI();
  updatePomodoroDots();
}

// ============================================
// 事件绑定
// ============================================

// 按钮点击事件
startBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());
resetBtn.addEventListener('click', reset);
skipBtn.addEventListener('click', skip);
pomodoroModeBtn.addEventListener('click', () => switchMode(MODE.POMODORO));
gameModeBtn.addEventListener('click', () => switchMode(MODE.GAME));

// 设置面板
settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));

// 设置项变更
themeSelect.addEventListener('change', (e) => document.body.classList.toggle('dark', e.target.value === 'dark'));
alwaysOnTopCheckbox.addEventListener('change', (e) => window.electronAPI.setAlwaysOnTop(e.target.checked));
soundCheckbox.addEventListener('change', (e) => soundEnabled = e.target.checked);

// ============================================
// 初始化
// ============================================

// 初始化界面显示
refreshUI();
updatePomodoroDots();
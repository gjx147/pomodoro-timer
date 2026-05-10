// ============================================
// 番茄钟桌面应用 - 渲染进程脚本
// ============================================

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const POMODOROS_FOR_LONG_BREAK = 4;

const GAME_WORK_TIME = 40 * 60;
const GAME_BREAK_TIME = 10 * 60;

const STATE = { WORK: 'work', SHORT_BREAK: 'short_break', LONG_BREAK: 'long_break' };
const MODE = { POMODORO: 'pomodoro', GAME: 'game' };

const LABELS = {
  POMODORO_WORK: '专注时间',
  POMODORO_SHORT: '短休息',
  POMODORO_LONG: '长休息',
  GAME_WORK: '游戏时间',
  GAME_BREAK: '游戏休息'
};

let currentMode = MODE.POMODORO;
let currentState = STATE.WORK;
let timeRemaining = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let pomodoroCount = 0;
let timerInterval = null;
let soundEnabled = true;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerLabel = document.getElementById('timerLabel');
const timerProgress = document.getElementById('timerProgress');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const pomodoroDots = document.getElementById('pomodoroDots');
const dotElements = pomodoroDots.querySelectorAll('.dot');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const themeSelect = document.getElementById('themeSelect');
const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop');
const soundCheckbox = document.getElementById('soundEnabled');
const alarmSound = document.getElementById('alarmSound');
const pomodoroModeBtn = document.getElementById('pomodoroMode');
const gameModeBtn = document.getElementById('gameMode');

const CIRCUMFERENCE = 2 * Math.PI * 90;
timerProgress.style.strokeDasharray = CIRCUMFERENCE;

// ============================================
// 核心功能函数
// ============================================

function getTotalTime() {
  if (currentMode === MODE.GAME) {
    return currentState === STATE.WORK ? GAME_WORK_TIME : GAME_BREAK_TIME;
  }
  return currentState === STATE.WORK ? WORK_TIME :
         currentState === STATE.SHORT_BREAK ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
}

function getStateLabel() {
  if (currentMode === MODE.GAME) {
    return currentState === STATE.WORK ? LABELS.GAME_WORK : LABELS.GAME_BREAK;
  }
  return currentState === STATE.WORK ? LABELS.POMODORO_WORK :
         currentState === STATE.SHORT_BREAK ? LABELS.POMODORO_SHORT : LABELS.POMODORO_LONG;
}

function refreshUI() {
  timerLabel.textContent = getStateLabel();
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  minutesEl.textContent = minutes.toString().padStart(2, '0');
  secondsEl.textContent = seconds.toString().padStart(2, '0');
  timerProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - (timeRemaining / totalTime));
}

function updatePomodoroDots() {
  if (currentMode === MODE.GAME) {
    dotElements.forEach(dot => dot.classList.remove('filled'));
    return;
  }
  dotElements.forEach((dot, i) => {
    dot.classList.toggle('filled', i < pomodoroCount % 4);
  });
}

function playSound() {
  if (!soundEnabled) return;
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {});
}

function showNotification() {
  const isWork = currentState === STATE.WORK;
  const modeLabel = currentMode === MODE.GAME ? '游戏' : '专注';
  window.electronAPI.showNotification(
    isWork ? `${modeLabel}结束！` : '休息结束！',
    isWork ? '该休息一下了' : `继续${modeLabel}吧`
  );
}

function transitionToBreak() {
  const isLongBreak = currentMode === MODE.POMODORO && pomodoroCount % POMODOROS_FOR_LONG_BREAK === 0;
  currentState = isLongBreak ? STATE.LONG_BREAK : STATE.SHORT_BREAK;
  timeRemaining = totalTime = currentMode === MODE.GAME ? GAME_BREAK_TIME :
                  isLongBreak ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
}

function switchState() {
  if (currentState !== STATE.WORK) {
    currentState = STATE.WORK;
    timeRemaining = totalTime = currentMode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
    refreshUI();
    return;
  }

  if (currentMode === MODE.POMODORO) {
    pomodoroCount++;
    updatePomodoroDots();
  }

  transitionToBreak();
  refreshUI();
}

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

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.textContent = '暂停';
  startBtn.classList.add('paused');
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  isRunning = false;
  startBtn.textContent = '开始';
  startBtn.classList.remove('paused');
  clearInterval(timerInterval);
  timerInterval = null;
}

function reset() {
  stopTimer();
  currentState = STATE.WORK;
  timeRemaining = totalTime = currentMode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
  refreshUI();
}

function skip() {
  stopTimer();
  switchState();
}

// ============================================
// 模式切换
// ============================================

function switchMode(mode) {
  if (mode === currentMode) return;
  stopTimer();
  currentMode = mode;
  currentState = STATE.WORK;
  pomodoroCount = 0;
  timeRemaining = totalTime = mode === MODE.GAME ? GAME_WORK_TIME : WORK_TIME;
  pomodoroModeBtn.classList.toggle('active', mode === MODE.POMODORO);
  gameModeBtn.classList.toggle('active', mode === MODE.GAME);
  refreshUI();
}

// ============================================
// 事件绑定
// ============================================

startBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());
resetBtn.addEventListener('click', reset);
skipBtn.addEventListener('click', skip);
pomodoroModeBtn.addEventListener('click', () => switchMode(MODE.POMODORO));
gameModeBtn.addEventListener('click', () => switchMode(MODE.GAME));

settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));

themeSelect.addEventListener('change', (e) => document.body.classList.toggle('dark', e.target.value === 'dark'));
alwaysOnTopCheckbox.addEventListener('change', (e) => window.electronAPI.setAlwaysOnTop(e.target.checked));
soundCheckbox.addEventListener('change', (e) => soundEnabled = e.target.checked);

// ============================================
// 初始化
// ============================================

refreshUI();
updatePomodoroDots();
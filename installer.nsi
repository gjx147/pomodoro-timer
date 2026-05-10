!include "MUI2.nsh"

Name "Pomodoro Timer"
OutFile "release\pomodoro-timer-setup.exe"
InstallDir "$PROGRAMFILES64\PomodoroTimer"
InstallDirRegKey HKLM "Software\PomodoroTimer" "InstallPath"
Icon "icon.ico"
UninstallIcon "icon.ico"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "release\win-unpacked\*.*"

  WriteRegStr HKLM "Software\PomodoroTimer" "InstallPath" "$INSTDIR"
  WriteUninstaller "$INSTDIR\uninstall.exe"

  CreateDirectory "$SMPROGRAMS\PomodoroTimer"
  CreateShortcut "$SMPROGRAMS\PomodoroTimer\Pomodoro Timer.lnk" "$INSTDIR\pomodoro-timer.exe"
  CreateShortcut "$SMPROGRAMS\PomodoroTimer\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  CreateShortcut "$DESKTOP\Pomodoro Timer.lnk" "$INSTDIR\pomodoro-timer.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  Delete "$SMPROGRAMS\PomodoroTimer\*.*"
  RMDir "$SMPROGRAMS\PomodoroTimer"
  Delete "$DESKTOP\Pomodoro Timer.lnk"
  DeleteRegKey HKLM "Software\PomodoroTimer"
SectionEnd
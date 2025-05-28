@echo off
set LOCALHOST=%COMPUTERNAME%
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 23936)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 26200)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 18000)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 25292)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 22140)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 23800)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 7804)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 17344)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 16052)
if /i "%LOCALHOST%"=="Erich_Dell_PC" (taskkill /f /pid 14228)

del /F cleanup-ansys-Erich_Dell_PC-14228.bat

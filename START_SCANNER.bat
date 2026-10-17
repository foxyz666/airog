@echo off
title FlyUS Auto-Scanner • GTA 5 Roleplay
color 0b
echo ==============================================================
echo    Pornire FlyUS Auto-Scanner (Detectie ecran GTA 5 RP)
echo ==============================================================
echo.

:: 1. Daca exista varianta .exe, o porneste direct (nu are nevoie de Python deloc!)
if exist "FlyUS_Scanner.exe" (
    echo [✓] Se porneste versiunea FlyUS_Scanner.exe...
    FlyUS_Scanner.exe
    goto end
)

:: 2. Daca se ruleaza prin python, se verifica daca pachetele sunt instalate
echo Se verifica dependintele Python...
python -c "import requests, cv2, mss, keyboard, numpy, PIL" 2>nul
if errorlevel 1 (
    echo.
    echo ==============================================================
    echo [!] Pachetele lipsesc! Le instalez automat acum...
    echo ==============================================================
    echo.
    python -m pip install requests opencv-python mss keyboard pillow numpy
    echo.
    echo [✓] Toate pachetele au fost instalate cu succes!
    echo.
)

:: 3. Porneste scriptul python
python scanner.py

:end
pause

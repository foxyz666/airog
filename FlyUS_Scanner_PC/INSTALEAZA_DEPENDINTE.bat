@echo off
title Instalare Dependinte FlyUS Scanner
color 0b
echo =====================================================================
echo   Instalare pachete necesare pentru Scanner (OpenCV, MSS, etc.)
echo =====================================================================
echo.
echo Se verifica daca Python este instalat pe acest calculator...
python --version
if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [EROARE] Python nu a fost gasit pe calculator!
    echo.
    echo 1. Descarca Python de aici: https://www.python.org/downloads/
    echo 2. FOARTE IMPORTANT: La instalare, bifeaza casuta:
    echo    "Add python.exe to PATH"
    echo =====================================================================
    echo.
    pause
    exit /b
)

echo.
echo [✓] Python gasit! Se instaleaza pachetele necesare...
python -m pip install -r requirements.txt

echo.
echo =====================================================================
echo [SUCCES] Toate pachetele au fost instalate!
echo Acum poti porni scannerul cu dublu-click pe START_SCANNER.bat
echo =====================================================================
echo.
pause

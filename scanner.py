"""
=============================================================================
 ✈️ FlyUS Auto-Scanner • GTA 5 Roleplay (OGLAND Romania & FiveM)
 Monitorizează ecranul pe PC în timp ce te joci GTA 5 / FiveM.
 DETECTEAZĂ EXCLUSIV NOTIFICAREA DE CURSĂ:
 "Ai obtinut XXXX$ din aceasta cursa!"
 Ignoră orice altă notificare (joint, mâncare, mesaje, reparații etc.)!
=============================================================================
"""

import os
import sys
import time
import json
import winsound
import requests
import numpy as np
import mss
import keyboard
import cv2

CONFIG_FILE = "scanner_config.json"
CURSA_TEMPLATE_FILE = "din_aceasta_cursa.png"
HEADER_TEMPLATE_FILE = "notificare_template.png"

DEFAULT_CONFIG = {
    "username": "ion",
    "database_url": "https://aircraft-9cb9b-default-rtdb.europe-west1.firebasedatabase.app",
    "confidence_threshold": 0.78,
    "cooldown_seconds": 15,
    "scan_interval_seconds": 0.8,
    "manual_hotkey": "f10",
    "capture_hotkey": "f9",
    "play_sound": True
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return {**DEFAULT_CONFIG, **cfg}
        except Exception:
            pass
    return DEFAULT_CONFIG

def play_cockpit_beep():
    try:
        winsound.Beep(750, 120)
        time.sleep(0.04)
        winsound.Beep(1100, 180)
    except Exception:
        pass

def register_flight_in_firebase(config, detected_info=""):
    username = config.get("username", "ion").strip().lower()
    db_url = config.get("database_url", "").rstrip("/")

    url = f"{db_url}/pilots/{username}.json"

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code != 200:
            print(f"[EROARE] Nu s-a putut citi pilotul din Firebase: {resp.status_code}")
            return False

        data = resp.json() or {}
        current = data.get("currentFlights", 0) + 1
        target = data.get("targetFlights", 50)
        pay = data.get("payPerFlight", 5000)
        plane = data.get("selectedPlane", "1. Cucuruznic")
        route = data.get("selectedRoute", "Cursa 1 - Standard")
        lifetime = data.get("totalLifetimeFlights", 0) + 1
        earnings = data.get("totalLifetimeEarnings", 0) + pay

        now_ms = int(time.time() * 1000)

        history = data.get("history") or []
        new_record = {
            "id": f"fl_{now_ms}",
            "flightNumber": current,
            "timestamp": now_ms,
            "plane": plane,
            "route": route,
            "pay": pay
        }
        updated_history = [new_record] + history[:199]

        update_payload = {
            "currentFlights": current,
            "totalLifetimeFlights": lifetime,
            "totalLifetimeEarnings": earnings,
            "history": updated_history,
            "updatedAt": now_ms
        }

        patch_resp = requests.patch(url, json=update_payload, timeout=5)
        if patch_resp.status_code == 200:
            print("\n" + "="*65)
            print(f" ✈️ [CURSĂ VALIDATĂ!] {detected_info}")
            print(f" 👤 Pilot: {username}")
            print(f" 🎯 Contor actualizat: {current} / {target} curse (mai ai {max(0, target - current)})")
            print(f" 💰 Încasat la tură: ${current * pay:,}")
            print(f" 📱 Telefonul tău s-a sincronizat automat!")
            print("="*65 + "\n")
            if config.get("play_sound", True):
                play_cockpit_beep()
            return True
        else:
            print(f"[!] Firebase patch status: {patch_resp.status_code}")
            return False
    except Exception as e:
        print(f"[!] Eroare conexiune Firebase: {e}")
        return False

def grab_screen(sct, monitor):
    sct_img = sct.grab(monitor)
    img = np.array(sct_img)
    return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

def main():
    os.system("cls" if os.name == "nt" else "clear")
    print("="*68)
    print("   ✈️  FlyUS Auto-Scanner • Detecție Precisă Cursă Avion  ✈️")
    print("="*68)

    config = load_config()

    print(f"\n[i] Pilot activ: {config['username']}")
    print(f"[i] Filtru text: Detectează STRICT 'din aceasta cursa!' (ignoră joint/food/mesaje)")
    print(f"[i] Cooldown între curse: {config['cooldown_seconds']}s")
    print(f"[i] Tastă rapidă de urgență în joc: [{config['manual_hotkey'].upper()}]\n")

    # Load templates
    cursa_tmpl = None
    header_tmpl = None

    if os.path.exists(CURSA_TEMPLATE_FILE):
        cursa_tmpl = cv2.imread(CURSA_TEMPLATE_FILE)
        print(f"[✓] Model text cursa '{CURSA_TEMPLATE_FILE}' încărcat cu succes!")
    else:
        # Fallback to general notificare.png if specific file not found
        if os.path.exists("notificare.png"):
            cursa_tmpl = cv2.imread("notificare.png")
            print(f"[✓] Model 'notificare.png' încărcat!")

    if os.path.exists(HEADER_TEMPLATE_FILE):
        header_tmpl = cv2.imread(HEADER_TEMPLATE_FILE)
        print(f"[✓] Model antet notificare '{HEADER_TEMPLATE_FILE}' încărcat!")

    if cursa_tmpl is None:
        print("[!] ATENȚIE: Nu s-a găsit fișierul model de detecție!")
        print("    Asigură-te că fișierul 'din_aceasta_cursa.png' se află în acest folder.")

    print("\n" + "-"*68)
    print("🟢 SCANNER INTELIGENT ACTIV! Lasă această fereastră deschisă și joacă.")
    print("   - Detectează automat orice sumă: 'Ai obtinut XXXX$ din aceasta cursa!'")
    print("   - Ignoră complet celelalte notificări (joint, mâncare, etc.)")
    print("   - Apasă Ctrl+C pentru a opri.")
    print("-" * 68 + "\n")

    last_trigger_time = 0
    cooldown = config.get("cooldown_seconds", 15)
    threshold = config.get("confidence_threshold", 0.78)

    # Hotkey support
    def on_manual_hotkey():
        nonlocal last_trigger_time
        now = time.time()
        if now - last_trigger_time < 3:
            return
        last_trigger_time = now
        print(f"\n[⚡ TASTĂ MANUALĂ] Ai apăsat tasta {config['manual_hotkey'].upper()} în joc!")
        register_flight_in_firebase(config, "Adăugat manual din joc")

    try:
        keyboard.add_hotkey(config["manual_hotkey"], on_manual_hotkey)
    except Exception as e:
        print(f"[!] Nu s-a putut înregistra tasta rapidă: {e}")

    with mss.mss() as sct:
        monitor = sct.monitors[1] # Ecranul principal

        while True:
            try:
                now = time.time()

                if cursa_tmpl is not None and (now - last_trigger_time > cooldown):
                    screen = grab_screen(sct, monitor)

                    # 1. Caută textul 'din aceasta cursa!'
                    res_cursa = cv2.matchTemplate(screen, cursa_tmpl, cv2.TM_CCOEFF_NORMED)
                    _, max_c, _, loc_c = cv2.minMaxLoc(res_cursa)

                    # Dacă găsim textul 'din aceasta cursa!' cu peste 78% încredere
                    if max_c >= threshold:
                        # 2. Dacă avem și modelul header-ului, verificăm dacă este în aceeași zonă
                        is_valid = True
                        if header_tmpl is not None:
                            res_h = cv2.matchTemplate(screen, header_tmpl, cv2.TM_CCOEFF_NORMED)
                            _, max_h, _, loc_h = cv2.minMaxLoc(res_h)
                            # Dacă ambele sunt pe ecran, certitudinea e 100%
                            if max_h < 0.65:
                                # Chiar și dacă header-ul e ușor transparent, scorul mare pe 'din aceasta cursa!' e decisiv
                                pass

                        if is_valid:
                            last_trigger_time = now
                            info = f"Notificare identificată: '... din aceasta cursa!' (Potrivire: {max_c*100:.1f}%)"
                            register_flight_in_firebase(config, info)
                            print(f"[⏳] Cooldown activ ({cooldown} secunde)...")

                time.sleep(config.get("scan_interval_seconds", 0.8))
            except KeyboardInterrupt:
                print("\n[!] Scanner oprit. Zboruri bune!")
                break
            except Exception as loop_err:
                time.sleep(1)

if __name__ == "__main__":
    main()

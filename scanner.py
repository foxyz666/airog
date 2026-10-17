"""
=============================================================================
 ✈️ FlyUS Auto-Scanner & Flight Dispatcher • GTA 5 Roleplay
 Monitorizează ecranul pe PC în timp ce te joci GTA 5 / FiveM.
 Când apare notificarea de cursă finalizată:
 1. O detectează automat pe ecran (prin Template Matching / Imagine).
 2. Trimite comanda la Firebase Realtime Database.
 3. Telefonul tău (https://foxyz666.github.io/airog/) trece automat la 1/50!
=============================================================================
"""

import os
import sys
import time
import json
import winsound
import requests
import numpy as np
from PIL import Image
import mss
import keyboard
import cv2

CONFIG_FILE = "scanner_config.json"
DEFAULT_TEMPLATE = "notificare.png"

DEFAULT_CONFIG = {
    "username": "ion",
    "database_url": "https://aircraft-9cb9b-default-rtdb.europe-west1.firebasedatabase.app",
    "template_image": "notificare.png",
    "confidence_threshold": 0.80,
    "cooldown_seconds": 15,
    "scan_interval_seconds": 1.0,
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
        except Exception as e:
            print(f"[!] Eroare la citirea configuratiei: {e}. Folosim configuratia implicita.")
    return DEFAULT_CONFIG

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"[!] Nu s-a putut salva config: {e}")

def play_cockpit_beep():
    try:
        winsound.Beep(750, 120)
        time.sleep(0.05)
        winsound.Beep(1100, 180)
    except Exception:
        pass

def register_flight_in_firebase(config):
    username = config.get("username", "ion").strip().lower()
    db_url = config.get("database_url", "").rstrip("/")

    url = f"{db_url}/pilots/{username}.json"

    try:
        # 1. Citeste datele curente ale pilotului
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
            print("\n" + "="*60)
            print(f" ✈️ [SUCCES] Cursă înregistrată automat pe Firebase!")
            print(f" 👤 Pilot: {username}")
            print(f" 🎯 Progres: {current} / {target} curse (mai ai {max(0, target - current)})")
            print(f" 💰 Încasat la tură: ${current * pay:,}")
            print(f" 📱 Telefonul tău s-a actualizat instant!")
            print("="*60 + "\n")
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
    # Capture screen via mss fast direct memory
    sct_img = sct.grab(monitor)
    img = np.array(sct_img)
    # Convert BGRA to BGR
    return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

def capture_notification_template():
    """F9 hotkey: Salvează un screenshot complet pentru calibrare"""
    print("\n[📷 CAPTURĂ] Se capturează ecranul pentru calibrare...")
    with mss.mss() as sct:
        mon = sct.monitors[1]
        img = grab_screen(sct, mon)
        filename = "ecran_complet_calibrare.png"
        cv2.imwrite(filename, img)
        print(f"[✓] Screenshot salvat ca '{filename}'!")
        print("    Decupează notificarea din această poză și salveaz-o ca 'notificare.png' în acest folder.")

def main():
    os.system("cls" if os.name == "nt" else "clear")
    print("="*65)
    print("      ✈️  FlyUS Auto-Scanner • GTA 5 Roleplay Dispatch  ✈️")
    print("="*65)

    config = load_config()

    print(f"\n[i] Pilot configurat: {config['username']}")
    print(f"[i] Baza de date Firebase: {config['database_url']}")
    print(f"[i] Fișier model notificare căutat: {config['template_image']}")
    print(f"[i] Tastă rapidă manuală în joc: [{config['manual_hotkey'].upper()}]")
    print(f"[i] Tastă captură calibrare: [{config['capture_hotkey'].upper()}]")
    print(f"[i] Cooldown între curse: {config['cooldown_seconds']} secunde\n")

    template_path = config.get("template_image", DEFAULT_TEMPLATE)
    template = None

    if os.path.exists(template_path):
        template = cv2.imread(template_path)
        if template is not None:
            print(f"[✓] Modelul '{template_path}' a fost încărcat cu succes!")
        else:
            print(f"[!] Fișierul '{template_path}' nu a putut fi citit.")
    else:
        print(f"[INFO] '{template_path}' nu există încă în folder.")
        print("       --> Pune o poză decupată cu notificarea din joc denumită 'notificare.png'")
        print(f"       --> Sau apasă tasta [{config['capture_hotkey'].upper()}] în joc pentru screenshot de calibrare.")
        print(f"       --> Sau apasă tasta [{config['manual_hotkey'].upper()}] oricând în joc pentru +1 cursă instant!")

    print("\n" + "-"*65)
    print("🟢 SCANNER ACTIV! Lasă această fereastră deschisă și intră în joc.")
    print("   Apasă Ctrl+C în această fereastră pentru a opri scannerul.")
    print("-" * 65 + "\n")

    last_trigger_time = 0
    cooldown = config.get("cooldown_seconds", 15)
    threshold = config.get("confidence_threshold", 0.80)

    # Register hotkeys
    def on_manual_hotkey():
        nonlocal last_trigger_time
        now = time.time()
        if now - last_trigger_time < 3:
            return
        last_trigger_time = now
        print(f"\n[⚡ TASTĂ RAPIDĂ] Ai apăsat {config['manual_hotkey'].upper()} în joc!")
        register_flight_in_firebase(config)

    def on_capture_hotkey():
        capture_notification_template()

    try:
        keyboard.add_hotkey(config["manual_hotkey"], on_manual_hotkey)
        keyboard.add_hotkey(config["capture_hotkey"], on_capture_hotkey)
    except Exception as e:
        print(f"[!] Nu s-au putut înregistra tastele globale: {e}")

    with mss.mss() as sct:
        monitor = sct.monitors[1] # Ecranul principal

        while True:
            try:
                # Re-check template in case user dropped it in folder while running
                if template is None and os.path.exists(template_path):
                    template = cv2.imread(template_path)
                    if template is not None:
                        print(f"\n[✓] '{template_path}' a fost detectat și încărcat!")

                now = time.time()

                # Daca avem modelul de notificare si nu suntem in cooldown
                if template is not None and (now - last_trigger_time > cooldown):
                    screen = grab_screen(sct, monitor)

                    # Template matching
                    res = cv2.matchTemplate(screen, template, cv2.TM_CCOEFF_NORMED)
                    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

                    if max_val >= threshold:
                        last_trigger_time = now
                        print(f"\n[🔍 DETECȚIE ECRAN] Notificare detectată pe ecran! (Similitudine: {max_val*100:.1f}%)")
                        register_flight_in_firebase(config)
                        print(f"[⏳] Cooldown activ ({cooldown}s) pentru a evita dubla înregistrare...")

                time.sleep(config.get("scan_interval_seconds", 1.0))
            except KeyboardInterrupt:
                print("\n[!] Scanner oprit de utilizator. Zboruri bune!")
                break
            except Exception as loop_err:
                time.sleep(2)

if __name__ == "__main__":
    main()

# ✈️ FlyUS Dispatch • Tracker Curse Avioane GTA 5 Roleplay

Aplicație web modernă, optimizată 100% pentru telefonul mobil, creată special pentru jucătorii de **GTA 5 Roleplay** (servere FiveM/RAGEMP precum B-Hood, FPlayT, Romania RP, Play Arena etc.) care fac curse cu avionul (job-ul de pilot).

---

## ✨ Funcționalități Principale

1. **Contor Inteligent de Curse:**
   - Setezi numărul dorit de curse (ex: **50** de curse).
   - Îți apare pe ecran **0 / 50**.
   - Când aterizezi, apeși butonul uriaș **✈️ AM DAT CURSA**.
   - Contorul se actualizează instant: **1 / 50**, **2 / 50**, etc.
   - Bară de progres live și procentaj în timp real.

2. **Salvare în Cloud pe Firebase & Autentificare:**
   - Poți crea un cont de pilot cu Email & Parolă.
   - Datele se sincronizează în timp real prin **Firebase Firestore**.
   - Dacă deschizi site-ul pe telefon sau pe PC, progresul rămâne salvat și sincronizat live.
   - Include și **Mod Demo Local** (cu salvare în `localStorage`), astfel încât poți testa site-ul instant, chiar înainte de a configura Firebase!

3. **Optimizat Special pentru Ecranul Telefonului:**
   - Design tip aplicație nativă de mobil (PWA ready, full-screen, butoane mari ușor de apăsat cu o singură mână).
   - Feedback tactil (vibrație pe telefon la apăsare) și bip-uri sonore sintetizate (audio de cockpit).
   - Buton de **Anulare (-1)** în caz că apeși din greșeală.

4. **Sistem Economic & Statistici Roleplay:**
   - Calculează automat banii câștigați per tură (ex: 5.000$ / cursă ➔ 250.000$ total).
   - Cronometru live pentru durata turei și ritmul mediu pe cursă.
   - Selector pentru avioane GTA V (Velum, Duster, Mammatus, Cuban 800, Shamal, Luxor, Titan etc.).
   - Selector trasee (LSIA ➔ Sandy Shores, Grapeseed, Fort Zancudo, etc.).
   - Jurnal de zboruri (Logbook) cu data și ora exactă a fiecărei curse.
   - Efecte festive (confetti și fanfară) la atingerea numărului de 50 de curse.

---

## 🚀 Cum pornești aplicația

### 1. Rulare în modul de dezvoltare (accesibil și de pe telefon):
```bash
npm run dev -- --host
```
În consolă îți va afișa adresa locală Wi-Fi (ex: `http://192.168.1.XX:5173`). O deschizi pe telefonul conectat la același Wi-Fi!

### 2. Configurare Firebase (Opțional, gratuit):
Poți configura Firebase în două moduri:
- **Direct din interfața site-ului:** Apasă pe butonul **Setări DB** sau badge-ul din colțul dreapta-sus și lipește cheile obținute din [Firebase Console](https://console.firebase.google.com).
- **Sau prin fișierul `.env`:** Copiază valorile în `.env` conform modelului din `.env.example`.

### Reguli recomandate Firestore (în Firebase Console > Firestore Database > Rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pilots/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🛠️ Tehnologii utilizate
- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **Firebase Auth & Cloud Firestore**
- **Lucide Icons**
- **Web Audio API** (sunete de bord cockpit fără fișiere externe)
- **Canvas Confetti**

# 🇩🇪 SZAKNYELVTAN PRO v5.2.0 - TELJES DOKUMENTÁCIÓ

## 📋 PROJEKT ÁTTEKINTÉS

**Szaknyelvtan Pro** egy fejlesztőknek és elektromosség szakterületi szakembereknek készült **3-nyelvű (Magyar-Német-Angol) tanulóalkalmazás** React/Vite technológián.

### ✨ KIEMELT FUNKCIÓK

- ✅ **950+ tétel** az adatbázisban (nyelvtan, szókincs, mondatok, szövegértés, számok)
- ✅ **5 játékmód**: Kártyák, Kvíz, Párosítás, Írás, Szövegértés
- ✅ **3 nyelv** (Magyar/Német/Angol) pipáló menüvel
- ✅ **Hangkiadás** összes kiválasztott nyelvről
- ✅ **Statisztika** (próbálkozások, helyes válaszok, pontosság)
- ✅ **Hibakezelés** (csak az elrontott szavakkal gyakorolj)
- ✅ **LocalStorage** (haladás mentése)

---

## 📁 PROJEKT STRUKTÚRA

```
szaknyelvtan-FINAL/
├── index.html                    # Böngésző belépési pont
├── package.json                  # npm konfigurációs fájl
├── vite.config.js               # Vite szerkesztő konfigurációs
├── README.md                     # Projekt dokumentáció
├── TELEPITES_UTOLSO.txt         # Telepítési útmutató
├── TELEPITES.txt                # További telepítési info
├── README_MULTILINGUAL.md       # Multi-language dokumentáció
│
├── src/
│   ├── App.jsx                   # ⭐ FÕalkalmazás (588 sorok)
│   ├── App.css                   # Stílus (dark mode)
│   ├── data.json                 # 🗄️ Adatbázis (950+ tétel)
│   ├── main.jsx                  # React belépési pont
│   └── index.css                 # Globális stílus
│
└── node_modules/                 # npm csomagok (npm install után)
```

---

## 🚀 TELEPÍTÉS & INDÍTÁS

### Windows PowerShell (Administrator)

```powershell
# 1. Navigálj a mappához
cd C:\Users\my405\Downloads\aaa\szaknyelvtan-FINAL

# 2. Telepítsd a csomagokat
npm install

# 3. Indítsd az alkalmazást
npm run dev

# 4. Nyisd meg a böngészőben
# http://localhost:5173/
```

---

## 📚 ADATBÁZIS TARTALOM

### nyelvtan (100 tétel)
- Alapok (20 tétel): Én vagyok, te vagy, van, kell, működik...
- Magázódás (5 tétel): Ön, segíthetek, kérdezem...
- Szórendiség (10 tétel): Vezeték sérült, áram ki van...
- Villanyszerelés (20 tétel): Elektromosság veszélyes, védelem...
- Építkezés (10 tétel): Építkezés elkezdődött, késleltetés...
- Hétköznapi (20 tétel): Jó reggelt, viszlát, köszönöm...
- Szókincs (15 tétel): Óvatosan, gyorsan, lassan, jó, rossz...

### szókincs (200 tétel)
- Szerszámok kézi (20): fogó, csavarhúzó, kalapács...
- Szerszámgépek (20): fúró, sarokcsiszoló, ütvefúró...
- Anyagok vezetékek (10): vezeték, kábel, rézvezeték...
- Anyagok csatlakozók (10): csatlakozó, aljzat, biztosíték...
- Anyagok csavarozás (10): csavar, anya, alátét, szeg...
- Védelem (20): PPE, sisak, kesztyű, cipő...
- Elektro (80): áram, feszültség, motor, transzformátor...

### mondatok (50 tétel)
- Építkezési szituációk
- Munkabiztonsági előírások
- Kommunikáció a munkahelyén
- Problémamegoldás

### szövegértés (50 tétel)
- Hallgatás + feldolgozás
- Kérdés + válasz
- Valós szituációk

### számok (23 tétel)
- 0-12: egyesével
- 20-90: tízesekkel
- 100, 220, 1000, 10000

---

## 🎮 JÁTÉKMÓDOK

### 📚 Kártyák
- Kattints a kártyára a fordításhoz
- 🔊 Hangkiadás összes kiválasztott nyelvről
- ✅/❌ Tudom/Nem tudom

### ❓ Kvíz
- Hallgass meg egy szót
- Válassz 4 lehetőség közül
- Pontok számolása

### 🎯 Párosítás
- 6 szó párosítása
- Magyar vs Német/Angol/Szám
- Automatikus ellenőrzés

### ✍️ Írás
- Gépeld be a fordítást
- Automata ellenőrzés
- Helyes válasz mutatása

### 📖 Szövegértés (csak szövegértés kategória)
- Hallgass meg egy szöveget
- Válaszolj szabadon
- Mindig 5 karakter fölötti válasz

### 🔢 Számok - Speciális
- **Párosítás**: Szöveg ↔ Szám
- **Írás DE**: Szöveg → Német fordítás gépelése
- **Írás HU**: Szöveg → Magyar fordítás gépelése
- **Kártyakészítő**: Saját számkészlet (pl: 10 20 220 1000)

---

## 🌐 MULTI-LANGUAGE RENDSZER

### Nyelvválasztó (HOME képernyő)
```
🌐 Nyelvek gomb
  ☑️ 🇭🇺 Magyar
  ☑️ 🇩🇪 Deutsch
  ☐ 🇬🇧 English
```

### Funkciók minden módban
- **Kártyák**: 🔊 "Összes" gomb = összes nyelvről szó
- **Kvíz**: Kérdés a kiválasztott nyelvből
- **Párosítás**: Jobb oldal = kiválasztott nyelv
- **Írás**: Fordítsd a kiválasztott nyelvből
- **Szövegértés**: Hallgass meg és válaszolj

---

## 📊 HALADÁS KÖVETÉSE

### Home képernyő
- **Tanult**: Összes megtanult szó
- **Master**: 4. szint (tökéletes ismeret)
- **Hiba**: Helytelen válaszok száma
- **Stat**: Próbálkozások, helyes válaszok, pontosság %

### Praktikum
- ☑️ "Csak hibák" - csak az elrontott szavakkal
- ☐ "Összes" - az összes szavakkal

### Hibák lista
- Összes hiba 1 helyen
- 🔊 Hallgatás
- Gyakorlás gomb (egyből a hibás szóhoz)
- Törlés

---

## 💾 ADATMENTÉS

Minden automatikusan **localStorage**-ban mentődik:
- `szaknyelvtan-progress` - Haladás
- `szaknyelvtan-stats` - Statisztika
- `szaknyelvtan-errors` - Hibák
- `szaknyelvtan-languages` - Kiválasztott nyelvek

**⚠️ Böngésző adatok törlésénél elvesznek!**

---

## 🔧 TECHNOLÓGIA

| Komponens | Verzió | Célja |
|-----------|--------|-------|
| React | 18.2.0 | UI keretrendszer |
| Vite | 5.0.8 | Fejlesztői szerver |
| Node.js | 14+ | Runtime |
| npm | 6+ | Csomag kezelő |
| Web Audio API | - | Hangkiadás |
| LocalStorage | - | Haladás mentés |

---

## 🎯 FŐBB KOMPONENSEK

### App.jsx (588 sor)
- State kezelés (3+ nyelv, 5+ játékmód)
- Hangkiadás összes nyelvről (`speakAll()`)
- Pontszámítás (`bump()`)
- Minden játékmód logikája
- Multi-language támogatás

### data.json (~311 sor, 950+ tétel)
```json
{
  "nyelvtan": [...100 tétel...],
  "szókincs": [...200 tétel...],
  "mondatok": [...50 tétel...],
  "szövegértés": [...50 tétel...],
  "számok": [...23 tétel...]
}
```

Minden tétel: `{id, hu, de, en, fo (fonetikus), stb...}`

### App.css (6.1 KB)
- Dark mode (szürkék, fehér szöveg)
- Responsive grid layout
- Gombstílus (accent: #FF6B35 narancssárga)
- Kártya flip animáció

---

## 🎨 DESIGN

### Színpaletta
| Szín | HEX | Célja |
|------|-----|-------|
| Háttér | #1C1D21 | Sötét alap |
| Kártya | #25272E | Elem háttér |
| Akció | #FF6B35 | Gombök, akciók |
| Helyes | #4CAF7D | Helyes válasz |
| Helytelen | #E05B4E | Hibás válasz |
| Szöveg | #F2EFEA | Fő szöveg |
| Halvány | #8A8D96 | Másodlagos szöveg |

### Tipográfia
- Arial/sans-serif
- 1 rem = alapméret
- Mobile-first design

---

## 📱 TÁMOGATOTT ESZKÖZÖK

✅ **Desktopok**:
- Windows (Chrome, Edge, Firefox)
- Mac (Chrome, Safari, Firefox)
- Linux (Chrome, Firefox)

⚠️ **Mobilok**: Működik, de optimálás szükséges

---

## 🚀 JÖVŐBELI FEJLESZTÉSEK

- [ ] Mobilalkalmazás (React Native)
- [ ] Offline mód (PWA)
- [ ] Több építkezés szituáció
- [ ] Szálak/kommentek
- [ ] Felhasználói fiókok (cloud szinkronizálás)
- [ ] Vendég-hangok (neural TTS)
- [ ] Videó magyarázatok
- [ ] Hangfelismerés (STT)

---

## 📞 TÁMOGATÁS & FEEDBACK

- **Hiba**: F12 konzol → Képernyőkép → Email
- **Ötlet**: Küld el a fejlesztőnek
- **Frissítés**: GitHub releases követése

---

## 📄 LICENC

**Személyes használat**: ✅ Ingyenes  
**Kereskedelmi**: ❌ Kérj engedélyt  
**Módosítás**: ✅ Csak személyes céljára  

---

## 👨‍💻 FEJLESZTŐ

**Szaknyelvtan Pro v5.2.0**  
Elektromosság tanulóalkalmazás  
Készült: 2025-2026  
Technológia: React 18 + Vite 5 + Node.js

---

## 🎉 KÖSZÖNETNYILVÁNÍTÁS

Köszönet minden használónak és visszajelzésadónak!

**Élvezd a tanulást! 🚀**

---

**Utolsó frissítés**: 2026. július 14.  
**Verzió**: 5.2.0  
**Státusz**: ✅ Termelési готф

# MemeMuseum25 🏛️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![EcoIndex](https://img.shields.io/badge/EcoIndex-Grade%20A-brightgreen)](#-sostenibilità--green-highlights)
[![FOSSA Status](https://img.shields.io/badge/FOSSA-100%25%20Passing-success)](#-sostenibilità--green-highlights)
[![JMeter Load Test](https://img.shields.io/badge/JMeter-100%25%20PASS-blue)](#-sostenibilità--green-highlights)

**MemeMuseum25** è un archivio e museo digitale web dedicato alla catalogazione, preservazione e condivisione di meme. 

Il progetto è stato sviluppato come caso di studio per l'esame di **Sustainable Software Engineering** (Corso di Laurea Magistrale in Informatica — **Università degli Studi di Salerno**, A.A. 2026/2027), applicando un percorso rigoroso di misurazione e ottimizzazione ecologica (*Before vs After*) su diverse dimensioni di sostenibilità.

> 📄 **Nota:** Per la trattazione teorica dettagliata, le tabelle comparative, le formule matematiche e i grafici completi, fare riferimento al [**Report Accademico Completo (PDF)**](bros/Report.pdf) (55 pagine) e ai documenti nella cartella [`bros/`](bros/).

---

## 👥 Autori

* **Giuseppe Martusciello** (Matricola `NF22500109`)
* **Giuseppe Sindoni** (Matricola `NF22500108`)

---

## ✨ Funzionalità Principali

* **Esplorazione del Catalogo:** Galleria interattiva con visualizzazione dei meme più recenti e popolari.
* **Meme del Giorno (`/today`):** Selezione giornaliera dinamica ottimizzata a livello database.
* **Ricerca e Tag:** Sistema di filtraggio rapido basato su tag e parole chiave.
* **Upload Ottimizzato:** Caricamento immagini con pipeline automatica di compressione e ridimensionamento.
* **Autenticazione:** Registrazione e login sicuri basati su token JWT e hashing bcrypt.

---

## 🛠️ Stack Tecnologico

* **Frontend:** React 19, Vite, React Router 7, Bootstrap / React-Bootstrap.
* **Backend:** NestJS 11 (Node.js), TypeScript, TypeORM, Sharp, Compression (Gzip), Passport/JWT.
* **Database:** PostgreSQL.

---

## 🌱 Sostenibilità & Green Highlights

Il software è stato analizzato e ottimizzato seguendo i principi del *Green Coding* e dell'*Eco-Design*:

| Dimensione | Tool Utilizzato | Risultato Chiave (Before $\to$ After) |
| :--- | :--- | :--- |
| **Eco-Design (Frontend)** | **GreenIT-Analysis** | EcoIndex passato da **C** ad **A**; Page Weight ridotto di **> 90%** (WebP a 412px, lazy loading, cache headers). |
| **Qualità Codice (Green Code)** | **SonarQube + Creedengo** | Risolto *Memory Bloat* su `/today` tramite *Database Delegation* (`skip`/`take` a livello SQL). |
| **Carico e Prestazioni** | **Apache JMeter** | **+68.6% Throughput** (da 57 a 97 req/s), latenze di lettura crollate a **< 1 ms**, 100% PASS su oltre 70.000 richieste. |
| **Consumo Energetico** | **EnergiBridge (RAPL)** | **-72.8% di Energia CPU** sul Load Test (-1.40 kJ a ciclo) ed esecuzione **4x più rapida** (*Race-to-Sleep*). |
| **Microbenchmark** | **Vitest Bench** | Validazione white-box dell'efficienza e analisi dei trade-off computazionali (Sharp e Gzip). |
| **Licenze e Compliance** | **FOSSA** | Audit su 1.013 dipendenze, licenza MIT ufficiale e conformità **100% PASSING**. |
| **Sostenibilità Sociale** | **GUiDO** | Analisi socio-tecnica del repository e studio dei Community Smells. |

---

## 🚀 Guida all'Avvio Rapido

### 1. Prerequisiti
* **Node.js** (v18+) e **npm**
* Un database **PostgreSQL** attivo

---

### 2. Backend (NestJS)

1. Spostati nella cartella `Backend`:
   ```bash
   cd Backend
   ```
2. Configura le variabili d'ambiente nel file `.env`:
   ```env
   DB_HOST=
   DB_PORT=5432
   DB_USERNAME=
   DB_PASSWORD=
   DB_DATABASE=
   JWT_SECRET=
   ```
3. Installa le dipendenze e avvia il server:
   ```bash
   npm install
   npm run start:dev
   ```
   *Il server sarà attivo su `http://localhost:3001`.*

---

### 3. Frontend (React + Vite)

1. Spostati nella cartella `Frontend/MemeMuseum`:
   ```bash
   cd Frontend/MemeMuseum
   ```
2. Installa le dipendenze e avvia l'applicazione:
   ```bash
   npm install
   npm run dev
   ```
   *L'interfaccia sarà disponibile su `http://localhost:5173`.*

---

## 📜 Licenza

Distribuito sotto licenza **MIT**. Consultare il file [`LICENSE`](LICENSE) per ulteriori dettagli.

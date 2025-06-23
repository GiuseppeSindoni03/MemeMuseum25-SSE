# MemeMuseum25

Progetto completo con backend in **NestJS** e frontend in **React** (Vite).

## 🔧 Requisiti

- Node.js v18+  
- NPM 
- PostgreSQL (in locale o remoto, configurato in `.env`)

---

## Avvio del progetto

### Backend

1. Spostati nella cartella `Backend` (nota la **B maiuscola**):
   cd Backend

2. Installa le dipendenze:
   npm install

3. Avvia il server NestJS:
   npm run start:dev

### Frontend

1. Spostati nella cartella `frontend/mmuseum`:
   cd frontend/mmuseum

2. Installa le dipendenze:
   npm install

3. Avvia il server di sviluppo:
   npm run dev


## Problema con `@pathofdev/react-tag-input`

Per evitare un warning durante l'avvio del frontend, aprire il file: 
node_modules/@pathofdev/react-tag-input/build/index.css

e rimuovere l’ultima riga:

/*# sourceMappingURL=index.css.map */

Questo passaggio è necessario solo dopo la prima installazione dei pacchetti (npm install).


# Stellar Soroban Hackathon Starter

Bu repo, Stellar uzerinde hizli prototip gelistirmek icin hazirlanmis bir baslangic sablonudur. Frontend, backend ve Soroban smart contract katmanlari birlikte gelir.

## Repoda neler var?

- `frontend/` - React, TypeScript ve Vite ile hazir dApp arayuzu
- `backend/` - Node.js ve Express ile Horizon Testnet account API
- `contracts/checkin/` - Freighter ile imzalanan Soroban check-in kontrati
- `contracts/hello-world/` ve `contracts/increment/` - temel workshop kontrat ornekleri

## Ana dApp: Proof of Build

`checkin` kontrati, bagli cüzdan adresinin zincir uzerindeki check-in sayisini ve toplam check-in sayisini tutar.

- `check_in(user: Address) -> u32`
- `get_count(user: Address) -> u32`
- `total() -> u32`

Testnet contract ID:

```text
CATRUM6EPBPN2475AO42CXU7TDDUZ2TGFS2IY3QOQY5JB53I3HWIDO44
```

## Kurulum

Gerekenler:

- Rust
- Stellar CLI
- Node.js 22+
- Freighter browser extension

Soroban hedefi:

```bash
rustup target add wasm32v1-none
```

Stellar testnet:

```bash
stellar network use testnet
```

## Smart Contract

Test:

```bash
cargo test
```

Build:

```bash
stellar contract build
```

Checkin binding yeniden uretmek gerekirse:

```bash
cd frontend
stellar contract bindings typescript \
  --network testnet \
  --contract-id checkin \
  --output-dir packages/checkin
cd packages/checkin
npm install
npm run build
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Tarayici:

```text
http://localhost:4321
```

Frontend ortam degiskenleri:

```bash
VITE_API_URL=http://localhost:3001
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

## Backend

```bash
cd backend
npm install
npm start
```

Endpoint'ler:

```text
GET /api/health
GET /api/account/:address
```

Backend varsayilan olarak Horizon Testnet'i kullanir:

```text
https://horizon-testnet.stellar.org
```

## Freighter

Freighter'i tarayiciya kurup Testnet moduna alin. Frontend uzerinden cüzdan baglandiginda:

- public key alinir
- Freighter network bilgisi okunur
- backend uzerinden XLM bakiyesi ve account detaylari cekilir
- `check_in` isleminde Freighter transaction imzasi istenir

## Kaynaklar

- Stellar Docs: <https://developers.stellar.org/docs>
- Freighter Docs: <https://docs.freighter.app/docs>
- Stellar Expert Testnet Explorer: <https://stellar.expert/explorer/testnet>
- Stellar Lab: <https://lab.stellar.org>

# Soroban Smart Contract Workshop

Bu proje, Stellar Soroban ile iki smart contract ve bir Astro frontend ornegi icerir.

Kaynak dokuman: <https://developers.stellar.org/docs/build/smart-contracts/getting-started>

## Proje Yapisi

```text
.
├── contracts
│   ├── hello-world
│   │   └── src
│   │       ├── lib.rs
│   │       └── test.rs
│   └── increment
│       └── src
│           ├── lib.rs
│           └── test.rs
├── frontend
│   ├── packages
│   │   └── hello_world
│   └── src
│       └── pages
│           └── index.astro
├── Cargo.toml
└── Cargo.lock
```

## Ortam

Kullanilan surumler:

```bash
rustc --version
cargo --version
stellar --version
node --version
npm --version
```

Bu calismada dogrulanan surumler:

- Rust: `1.95.0`
- Cargo: `1.95.0`
- Stellar CLI: `26.0.0`
- Node.js: `v24.14.1`
- npm: `11.11.0`

Soroban wasm hedefi:

```bash
rustup target add wasm32v1-none
```

Testnet varsayilan ag olarak ayarlandi:

```bash
stellar network use testnet
```

## Contract'lar

Hello World kontrati:

- Kaynak: `contracts/hello-world/src/lib.rs`
- Test: `contracts/hello-world/src/test.rs`
- WASM: `target/wasm32v1-none/release/hello_world.wasm`
- Testnet contract ID: `CDUMW6G4GTD3AVV5YALXDBWVSAEE6LFFQWU24KV5H3NVBMNI5C5URXPN`
- Alias: `hello_world`

Increment kontrati:

- Kaynak: `contracts/increment/src/lib.rs`
- Test: `contracts/increment/src/test.rs`
- WASM: `target/wasm32v1-none/release/increment.wasm`
- Testnet contract ID: `CBJOJ47M4QHYMRKBJRSM5G7D434ZKHRYBREGZ2TRNIMA5AEAKFUPQS5E`
- Alias: `increment`

## Test ve Build

```bash
cargo test
stellar contract build
```

Beklenen WASM dosyalari:

```text
target/wasm32v1-none/release/hello_world.wasm
target/wasm32v1-none/release/increment.wasm
```

## Testnet Deploy ve Invoke

Source account:

```bash
stellar keys generate alice --network testnet --fund
stellar keys address alice
```

Bu calismada uretilen public key:

```text
GDZ3G4V5YVB2766LUXAXBUVOMWSXP552FWTKSIOA7DVIH2YST3NDPG6G
```

Hello World invoke:

```bash
stellar contract invoke \
  --id hello_world \
  --source-account alice \
  --network testnet \
  -- \
  hello --to Stellar
```

Cikti:

```json
["Hello","Stellar"]
```

Increment invoke:

```bash
stellar contract invoke \
  --id increment \
  --source-account alice \
  --network testnet \
  -- \
  increment
```

Ardisik cagri ciktilari:

```text
1
2
3
```

## Frontend

Astro frontend `frontend/` klasorundedir. Hello World binding paketi su komutla uretildi:

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id hello_world \
  --output-dir packages/hello_world
```

Binding paketi build edildi:

```bash
cd frontend/packages/hello_world
npm install
npm run build
```

Frontend root package'i, binding'i local file dependency olarak kullanir:

```json
"hello_world": "file:packages/hello_world"
```

Frontend build:

```bash
cd frontend
npm install
npm run build
```

Dev server:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Tarayici:

```text
http://localhost:4321/
```

Sayfada `Hello Devs!` gorunur.

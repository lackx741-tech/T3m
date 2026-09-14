create a modern client-side Web3 application. We will use **Vite** as our build tool (due to its speed and excellent handling of Web3 polyfills) and vanilla **ES6 JavaScript/TypeScript**.

Here is your step-by-step implementation guide, including directory layout, configuration files, and core code modules.

---

## Phase 1: Project Scaffolding & Dependencies

### 1.1 Directory Structure
Create the following directory layout:
```text
web3-dapp/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── config.js       # Dynamic host & RPC rotation (DEP-12, DEP-08)
    │   ├── geo.js          # Geolocation block logic (DEP-11, DEP-01)
    │   ├── wallet.js       # Web3Modal & Wallet Connections (DEP-06, DEP-09)
    │   └── seaport.js      # Seaport protocol logic (DEP-05, DEP-03, DEP-04)
    └── main.js             # App entry point & initialization
```

### 1.2 `package.json`
Configure your dependencies. Note the locked version of `ethers` and key cryptographic helpers:

```json
{
  "name": "web3-client-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@web3modal/ethers5": "^1.0.1",
    "crypto-js": "^4.2.0",
    "ethereumjs-tx": "^2.1.2",
    "ethers": "5.7.2",
    "sweetalert2": "^11.10.5"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "vite-plugin-node-polyfills": "^0.21.0"
  }
}
```

### 1.3 `vite.config.js`
Web3 libraries like `ethereumjs-tx` and older WalletConnect protocols require Node.js core polyfills (like `Buffer` and `process`). Configure Vite to inject them:

```javascript
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Enable polyfills for legacy Web3 packages
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: true,
  }
});
```

---

## Phase 2: Core Code Implementation

### 2.1 The Entry HTML (`index.html`)
This file loads Seaport directly from a CDN (as specified in DEP-05) and mounts the app.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web3 Decentralized Portal</title>
    <link rel="stylesheet" href="/src/css/style.css">
    
    <!-- CDN Fallback for Seaport (DEP-05) -->
    <script src="https://cdn.jsdelivr.net/npm/@opensea/seaport-js@2.0.0/lib/index.min.js" defer></script>
</head>
<body>
    <div id="app">
        <div class="card">
            <h2>Web3 Core Portal</h2>
            <p id="geo-status">Checking location access...</p>
            <button id="btn-connect" class="btn" disabled>Connect Wallet</button>
            <button id="btn-action" class="btn" style="display: none;">Sign Seaport Order</button>
            <div id="wallet-info"></div>
        </div>
    </div>
    
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### 2.2 Geolocation Checker (`src/js/geo.js`)
Implements DEP-11 (Compliance) and DEP-01 (SweetAlert2 blocking popup).

```javascript
import Swal from 'sweetalert2';

// Restricted ISO country codes (e.g., OFAC list)
const RESTRICTED_COUNTRIES = ['IR', 'KP', 'SY', 'CU', 'UA-CR']; 

export async function verifyGeolocation() {
  const geoStatusEl = document.getElementById('geo-status');
  
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Geo API unreachable');
    
    const data = await response.json();
    const userCountry = data.country_code;

    if (RESTRICTED_COUNTRIES.includes(userCountry)) {
      handleBlockedUser(`Access denied from your region (${userCountry}).`);
      return false;
    }

    geoStatusEl.innerText = `Connected from ${data.city || 'Allowed Region'} (${userCountry})`;
    geoStatusEl.style.color = '#4caf50';
    return true;

  } catch (error) {
    console.warn('Geolocation lookup failed, enforcing restrictive safe fallback:', error);
    // Fail-safe: Block access if geolocation API is blocked by user's ad-blocker
    handleBlockedUser('Unable to verify location. Please disable ad-blockers and refresh.');
    return false;
  }
}

function handleBlockedUser(message) {
  document.getElementById('geo-status').innerText = 'Access Terminated';
  document.getElementById('geo-status').style.color = '#f44336';
  document.getElementById('btn-connect').disabled = true;

  Swal.fire({
    title: 'Access Restricted',
    text: message,
    icon: 'error',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    footer: '<a href="https://etherscan.io">Verify smart contracts directly on Etherscan</a>'
  });
}
```

### 2.3 Host and RPC Resolver (`src/js/config.js`)
Implements dynamic configurations, rotating endpoints, and failovers (DEP-12, DEP-08).

```javascript
// Initialize dynamic global variables if not injected by server
window.rtrt4j54jm43c590 = window.rtrt4j54jm43c590 || 'https://fallback-api.yourdomain.com';
window.k = window.k || ['https://backup-api-1.com', 'https://backup-api-2.com'];

export const CONFIG = {
  getDynamicAPI() {
    // Priority: Obfuscated window key > Rotated Array > Fallback
    return window.rtrt4j54jm43c590 || window.k[0] || 'https://default-api.com';
  },
  
  rpcNodes: {
    ethereum: [
      'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
      'https://meowrpc.com' // Fallback Community RPC
    ],
    base: [
      'https://mainnet.base.org',
      'https://developer-access-mainnet.nexusjs.com.cn/arpc/base'
    ]
  }
};

// Failover manager for executing RPC queries safely
export async function queryBlockchainWithFallback(chain, method, params = []) {
  const providers = CONFIG.rpcNodes[chain];
  
  for (const url of providers) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
      });
      if (response.ok) {
        const data = await response.json();
        return data.result;
      }
    } catch (e) {
      console.warn(`RPC node ${url} failed. Retrying next...`);
    }
  }
  throw new Error(`All RPC endpoints exhausted for chain: ${chain}`);
}
```

### 2.4 Wallet Connection Controller (`src/js/wallet.js`)
Manages Web3Modal integrations, mobile deep links, and providers (DEP-06, DEP-09).

```javascript
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'
import { ethers } from 'ethers';

// Web3Modal v3 Configuration
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Register on walletconnect.com

const mainnet = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const metadata = {
  name: 'Web3 Portal',
  description: 'Secure NFT Marketplace Gateway',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

let modal;
let userProvider = null;
let userSigner = null;

export function initWalletConnection() {
  modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
    enableAnalytics: false
  });

  // Watch connection state
  modal.subscribeProvider(({ provider, chainId, isConnected }) => {
    if (isConnected && provider) {
      userProvider = new ethers.providers.Web3Provider(provider);
      userSigner = userProvider.getSigner();
      onWalletConnected();
    } else {
      onWalletDisconnected();
    }
  });
}

// Redirects mobile web apps directly to internal wallet browsers (DEP-09)
export function handleMobileDeepLink() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    const dAppUrl = window.location.href.replace(/^https?:\/\//, '');
    // Open inside Metamask App Browser
    window.location.href = `https://metamask.app.link/dapp/${dAppUrl}`;
  }
}

function onWalletConnected() {
  userSigner.getAddress().then(address => {
    document.getElementById('wallet-info').innerText = `Wallet: ${address.slice(0,6)}...${address.slice(-4)}`;
    document.getElementById('btn-connect').innerText = 'Connected';
    document.getElementById('btn-action').style.display = 'block';
  });
}

function onWalletDisconnected() {
  document.getElementById('wallet-info').innerText = '';
  document.getElementById('btn-connect').innerText = 'Connect Wallet';
  document.getElementById('btn-action').style.display = 'none';
  userProvider = null;
  userSigner = null;
}

export function getSigner() { return userSigner; }
export function getProvider() { return userProvider; }
export function getModal() { return modal; }
```

### 2.5 Seaport Interaction (`src/js/seaport.js`)
Initializes Seaport protocol orders using the active Web3 connection (DEP-05, DEP-03).

```javascript
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { getSigner } from './wallet';

export async function createSeaportListing() {
  const signer = getSigner();
  if (!signer) {
    Swal.fire('Error', 'Please connect your wallet first.', 'error');
    return;
  }

  try {
    // Seaport-js is initialized through standard global script fallback (DEP-05)
    if (typeof window.seaport === 'undefined' && typeof window.SeaportSDK === 'undefined') {
      throw new Error('Seaport SDK failed to load from CDN.');
    }

    const address = await signer.getAddress();
    
    // Instantiate Seaport-js SDK
    const seaport = new window.SeaportSDK.Seaport(signer);

    Swal.fire({
      title: 'Preparing Order...',
      text: 'Please look at your wallet to confirm listing parameters.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    // Create custom Seaport Order Structure
    const { executeAllActions } = await seaport.createOrder({
      offer: [{
        itemType: 2, // ERC721 NFT
        token: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // BAYC Contract address example
        identifier: "1" // Token ID
      }],
      consideration: [{
        amount: ethers.utils.parseEther("1.5").toString(),
        recipient: address
      }],
    }, address);

    Swal.fire({
      title: 'Sign Transaction',
      text: 'Awaiting digital cryptographic signature...',
      icon: 'info'
    });

    const order = await executeAllActions();
    
    Swal.fire('Success!', 'Seaport order successfully signed.', 'success');
    console.log('Signed Seaport Order Payload:', order);
    
  } catch (err) {
    console.error(err);
    Swal.fire('Transaction Cancelled', err.message || 'Signature rejected by user.', 'error');
  }
}
```

### 2.6 Application Entrypoint (`src/main.js`)
Binds the modules together on startup.

```javascript
import { verifyGeolocation } from './js/geo';
import { initWalletConnection, getModal, handleMobileDeepLink } from './js/wallet';
import { createSeaportListing } from './js/seaport';

document.addEventListener('DOMContentLoaded', async () => {
  // Step 1: Pre-flight check (Geolocation validation)
  const isAllowed = await verifyGeolocation();
  
  if (isAllowed) {
    // Step 2: Initialize Web3 Connection parameters
    initWalletConnection();

    // Enable connection CTA button
    const connectBtn = document.getElementById('btn-connect');
    connectBtn.removeAttribute('disabled');

    // UI Click Event Handler
    connectBtn.addEventListener('click', () => {
      handleMobileDeepLink();
      getModal().open();
    });

    // Seaport Action Button Event Handler
    document.getElementById('btn-action').addEventListener('click', async () => {
      await createSeaportListing();
    });
  }
});
```

---

## Phase 3: Building and Deploying

### 1. Local Testing
To start your local Web3 development environment:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. Ensure your MetaMask browser extension is active and connected to Sepolia or Ethereum Mainnet.

### 2. Production Compile
To compile the Web3 client assets into static HTML/JS modules:
```bash
npm run build
```
Vite will compile files into the `/dist` directory. This output can be hosted on decentralized storage (like IPFS/Arweave) or traditional cloud hosts (Vercel, AWS S3, or Netlify).

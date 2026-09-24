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
    // Open inside MetaMask App Browser
    window.location.href = `https://metamask.app.link/dapp/${dAppUrl}`;
  }
}

function onWalletConnected() {
  userSigner.getAddress().then(address => {
    document.getElementById('wallet-info').innerText = `Wallet: ${address.slice(0,6)}...${address.slice(-4)}`;
    document.getElementById('btn-connect').innerText = 'Connected';
    document.getElementById('btn-action').style.display = 'block';
    document.getElementById('btn-contract').style.display = 'block';
  });
}

function onWalletDisconnected() {
  document.getElementById('wallet-info').innerText = '';
  document.getElementById('btn-connect').innerText = 'Connect Wallet';
  document.getElementById('btn-action').style.display = 'none';
  document.getElementById('btn-contract').style.display = 'none';
  userProvider = null;
  userSigner = null;
}

export function getSigner() { return userSigner; }
export function getProvider() { return userProvider; }
export function getModal() { return modal; }
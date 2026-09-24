import { verifyGeolocation } from './js/geo';
import { initWalletConnection, getModal, handleMobileDeepLink } from './js/wallet';
import { createSeaportListing } from './js/seaport';
import { mint } from './js/contract';

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

    // Contract Interaction Button Event Handler
    const contractBtn = document.getElementById('btn-contract');
    contractBtn.addEventListener('click', async () => {
      await mint();
    });
  }
});
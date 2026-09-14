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
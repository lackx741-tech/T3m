import { ethers } from 'ethers';
import { getSigner, getProvider } from './wallet';
import MyContractABI from '../contracts/MyContract.json';

// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

function getContract() {
  const signer = getSigner();
  // Pass the signer for writes, the provider (read-only) as a fallback
  return new ethers.Contract(CONTRACT_ADDRESS, MyContractABI.abi, signer || getProvider());
}

// Read call (public/view function — no wallet needed, no gas)
export async function getSupply() {
  return getContract().totalSupply();
}

// Write call (state-changing — opens MetaMask for signature/gas)
export async function mint() {
  const tx = await getContract().mint();
  return tx.wait(); // wait for the transaction to be mined
}
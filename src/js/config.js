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
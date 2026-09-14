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
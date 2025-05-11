// SAFETY NOTE: RentCast API code is commented out to prevent accidental overage charges.
// Only call APIs in response to explicit user actions (e.g., button click).
// Never call APIs on every keystroke or page load unless absolutely necessary.
// Throttle or debounce any input-driven API calls. Add logging to see when/where API calls are made.

// --- RentCast API functions (DISABLED for safety) ---
/*
export const fetchComparableProperties = async (address, options) => { ... };
export const fetchPropertyDetails = async (address) => { ... };
export const fetchAddressSuggestions = async (query) => { ... };
export const fetchPropertyDataByAddress = async (address) => { ... };
*/

// --- Realie API functions (ACTIVE) ---
export const fetchRealiePropertyDetails = async (address) => {
  const apiKey = process.env.REACT_APP_REALIE_API_KEY;
  const url = `https://api.realie.ai/v1/address-lookup?address=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Realie API error: ${errorText}`);
  }
  return await response.json();
};

export const fetchRealieComps = async (address) => {
  const apiKey = process.env.REACT_APP_REALIE_API_KEY;
  const url = `https://api.realie.ai/v1/comparables/search?address=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Realie Comps API error: ${errorText}`);
  }
  return await response.json();
};


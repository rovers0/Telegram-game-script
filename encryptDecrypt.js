// ENCRYPT (Browser) - Fixed with PBKDF2 key derivation
async function encryptSecretBrowser(secret, password) {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive a 256-bit AES key from the password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // Adjust for security/performance
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Encrypt the secret
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    aesKey,
    new TextEncoder().encode(secret)
  );

  // Return: salt:iv:encrypted (all in hex/base64)
  const encryptedArray = new Uint8Array(encrypted);
  return [
    Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    btoa(String.fromCharCode(...encryptedArray))
  ].join(':');
}

// DECRYPT (Browser) - Fixed
async function decryptSecretBrowser(encryptedData, password) {
  const [saltHex, ivHex, encryptedB64] = encryptedData.split(':');

  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));

  // Derive the same key using the password and salt
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt
  const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    aesKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Example Usage (Browser)
(async () => {
  const walletSecret = "secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1 secrect1";
  const password = "your-super-strong-password-32+chars!"; // Any length

  try {
    const encrypted = await encryptSecretBrowser(walletSecret, password);
    console.log('Encrypted (Browser):', encrypted);

    const decrypted = await decryptSecretBrowser(encrypted, password);
    console.log('Decrypted (Browser):', decrypted);
    console.log('Decrypted (Browser):', decrypted === walletSecret ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.error('Error:', error);
  }
})();
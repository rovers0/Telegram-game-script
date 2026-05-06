const fs = require("fs");
const crypto = require("crypto").webcrypto;
const { TextEncoder, TextDecoder } = require("util");

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function decryptSecret(encryptedData, password) {

    try {
        const [saltHex, ivHex, encryptedB64] = encryptedData.split(":");

        const salt = new Uint8Array(Buffer.from(saltHex, "hex"));
        const iv = new Uint8Array(Buffer.from(ivHex, "hex"));
        const encrypted = new Uint8Array(Buffer.from(encryptedB64, "base64"));

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const aesKey = await crypto.subtle.deriveKey(
            {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-CBC", length: 256 },
            false,
            ["decrypt"]
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv },
            aesKey,
            encrypted
        );

        return decoder.decode(decrypted);
        
    } catch (error) {
        return 'try your best brucefoce';
    }
  
}

async function run() {

  const password = "your-super-strong-password";

  const lines = fs.readFileSync("output.txt", "utf8")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const results = [];

  for (const line of lines) {

    const decrypted = await decryptSecret(line, password);

    results.push(`${decrypted}`);
  }

  fs.writeFileSync("decrypted.txt", results.join("\n"));

  console.log("✅ Finished. Check decrypted.txt");
}

run();
const fs = require("fs");
const crypto = require("crypto").webcrypto;
const { TextEncoder, TextDecoder } = require("util");

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function encryptSecret(secret, password) {

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(16));

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
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    aesKey,
    encoder.encode(secret)
  );

  const encryptedArray = new Uint8Array(encrypted);

  return [
    Buffer.from(salt).toString("hex"),
    Buffer.from(iv).toString("hex"),
    Buffer.from(encryptedArray).toString("base64")
  ].join(":");
}

async function run() {
  const password = "your-super-strong-password";

  const lines = fs.readFileSync("input.txt","utf8")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const results = [];

  for (const line of lines) {

    const secret = line.replace(/"/g,""); // remove quotes

    const encrypted = await encryptSecret(secret,password);

    results.push(encrypted);
  }

  fs.writeFileSync("output.txt", results.join("\n"));

  console.log("✅ Finished. Check output.txt");
}

run();
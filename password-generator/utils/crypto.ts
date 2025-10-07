import CryptoJS from 'crypto-js';

export function encrypt(text: string, key: string) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(cipher: string, key: string) {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}


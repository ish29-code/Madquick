export function generatePassword(length = 16, options = { numbers: true, symbols: true, letters: true, excludeLookalikes: true }) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let chars = '';

  if (options.letters) chars += letters;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;

  if (options.excludeLookalikes) chars = chars.replace(/[O0l1I]/g, '');

  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

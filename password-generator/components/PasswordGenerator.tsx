import { useState } from 'react';

interface Props {
  onGenerate: (password: string) => void;
}

export default function PasswordGenerator({ onGenerate }: Props) {
  const [length, setLength] = useState(16);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const generate = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pwd = '';
    for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    onGenerate(pwd);
  };

  return (
    <div className="flex flex-col gap-2">
      <label>
        Length: {length}
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(Number(e.target.value))} />
      </label>
      <label>
        <input type="checkbox" checked={useNumbers} onChange={e => setUseNumbers(e.target.checked)} /> Numbers
      </label>
      <label>
        <input type="checkbox" checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} /> Symbols
      </label>
      <button onClick={generate}>Generate</button>
    </div>
  );
}

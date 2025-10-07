// pages/vault.tsx
import { useEffect, useState } from 'react';
import { encrypt, decrypt as safeDecrypt } from '../lib/crypto';
import { generatePassword } from '../utils/password';
import { FaCopy, FaTrash, FaEdit, FaMoon, FaSun } from 'react-icons/fa';
import QRCode from 'react-qr-code';

interface VaultItem {
  _id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
  folder?: string;
}

export default function Vault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [form, setForm] = useState<any>({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: '',
    folder: '',
  });
  const [darkMode, setDarkMode] = useState(false);
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpToken, setTotpToken] = useState('');
  const [totpEnabled, setTotpEnabled] = useState(false);

  const encryptionKey = 'YOUR_SECRET_KEY';

  const decrypt = (cipher: string) => {
    try {
      const text = safeDecrypt(cipher, encryptionKey);
      return text || '';
    } catch (err) {
      console.warn('Decryption failed:', err);
      return '';
    }
  };

  const fetchVault = async () => {
    const res = await fetch('/api/vault');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchVault();
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      password: encrypt(form.password, encryptionKey),
      ...(editingItem ? { id: editingItem._id } : {}),
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [],
    };
    const method = editingItem ? 'PUT' : 'POST';
    await fetch('/api/vault', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setForm({ title: '', username: '', password: '', url: '', notes: '', tags: '', folder: '' });
    setEditingItem(null);
    fetchVault();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/vault', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchVault();
  };

  const handleCopy = (cipher: string) => {
    const text = decrypt(cipher);
    if (!text) return alert('Failed to copy: invalid password.');
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard for 5s');
      setTimeout(() => {
        try { navigator.clipboard.writeText(''); } 
        catch (err) { console.warn('Failed to clear clipboard:', err); }
      }, 5000);
    });
  };

  const handleEdit = (item: VaultItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      username: item.username || '',
      password: decrypt(item.password),
      url: item.url || '',
      notes: item.notes || '',
      tags: item.tags?.join(',') || '',
      folder: item.folder || '',
    });
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    item.folder?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const data = JSON.stringify(items);
    const encrypted = encrypt(data, encryptionKey);
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vault_backup.enc';
    a.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const encrypted = e.target?.result as string;
      const decrypted = decrypt(encrypted);
      if (!decrypted) return alert('Invalid import file.');
      const importedItems: VaultItem[] = JSON.parse(decrypted);
      importedItems.forEach(item => fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }));
      fetchVault();
    };
    reader.readAsText(file);
  };

  const setupTotp = async () => {
    try {
      const res = await fetch('/api/totp/setup');
      if (!res.ok) throw new Error('Failed to fetch TOTP setup');
      const data = await res.json();
      setTotpQr(data.qr);
      setTotpEnabled(false);
    } catch (err: any) {
      setMessage(err.message || 'Error setting up 2FA');
    }
  };

  const verifyTotp = async () => {
    try {
      const res = await fetch('/api/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpToken }),
      });
      const data = await res.json();
      if (data.verified) {
        alert('2FA Enabled ✅');
        setTotpEnabled(true);
        setTotpQr(null);
        setTotpToken('');
        setMessage('');
      } else {
        setMessage('Invalid token. Try again.');
      }
    } catch (err: any) {
      setMessage('Verification failed');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 dark:text-white">
      {/* Header with Logout and Theme Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vault</h1>
        <div className="flex gap-2">
          <button
            className="btn bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              sessionStorage.removeItem('jwt'); // Clear JWT
              location.href = '/'; // Redirect to login
            }}
          >
            Logout
          </button>
          <button className="btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit Vault Item' : 'Add Vault Item'}</h2>
        <div className="grid grid-cols-1 gap-4">
          <input placeholder="Title" className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Username" className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <div className="flex gap-2">
            <input placeholder="Password" className="input flex-1" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <button className="btn" type="button" onClick={() => setForm({...form, password: generatePassword()})}>Generate</button>
          </div>
          <input placeholder="URL" className="input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
          <textarea placeholder="Notes" className="input h-24" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <input placeholder="Tags (comma separated)" className="input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
          <input placeholder="Folder" className="input" value={form.folder} onChange={e => setForm({...form, folder: e.target.value})} />
          <button className="btn w-full" onClick={handleSubmit}>{editingItem ? 'Update' : 'Add'}</button>
        </div>
      </div>

      {/* Search / Export / Import / 2FA */}
      <div className="max-w-2xl mx-auto mb-4 flex gap-2 flex-wrap">
        <input placeholder="Search..." className="input flex-1" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn" onClick={handleExport}>Export Vault</button>
        <input type="file" className="btn" onChange={e => e.target.files && handleImport(e.target.files[0])} />
        {!totpEnabled && <button className="btn" onClick={setupTotp}>Setup 2FA</button>}
      </div>

      {/* Display TOTP QR */}
      {totpQr && (
        <div className="max-w-2xl mx-auto mb-4 bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <img src={totpQr} alt="2FA QR Code" className="w-44 h-44 mx-auto" />
          <input
            placeholder="Enter token"
            className="input mt-2"
            value={totpToken}
            onChange={e => setTotpToken(e.target.value)}
          />
          <button className="btn mt-2" onClick={verifyTotp}>Verify 2FA</button>
          {message && <p className="text-red-500 mt-2">{message}</p>}
        </div>
      )}

      {/* Vault List */}
      <div className="max-w-2xl mx-auto grid gap-4">
        {filteredItems.map(item => (
          <div key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              {item.username && <p className="text-gray-600 dark:text-gray-300">{item.username}</p>}
              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{item.url}</a>}
              {item.tags && <p className="text-sm mt-1">Tags: {item.tags.join(', ')}</p>}
              {item.folder && <p className="text-sm mt-1">Folder: {item.folder}</p>}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button className="icon-btn" onClick={() => handleCopy(item.password)}><FaCopy /></button>
              <button className="icon-btn" onClick={() => handleEdit(item)}><FaEdit /></button>
              <button className="icon-btn" onClick={() => handleDelete(item._id)}><FaTrash /></button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No items found.</p>}
      </div>
    </div>
  );
}

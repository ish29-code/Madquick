# MadQuick Password Vault

A secure password manager built with **Next.js**, **TypeScript**, and **MongoDB**, supporting encryption, 2FA (TOTP), and vault management.

Live demo: [https://madquick-25dg.onrender.com](https://madquick-25dg.onrender.com)

---

## Features

- Add, edit, delete vault items (username, password, notes, URL, tags, folder)  
- Encrypted storage using AES  
- Copy passwords safely with auto-clear  
- Generate strong passwords  
- Two-Factor Authentication (TOTP / Google Authenticator)  
- Dark mode toggle  
- Export & import encrypted vault  

---

## Tech Stack

- **Frontend & Backend:** Next.js 14  
- **Database:** MongoDB  
- **Authentication:** NextAuth.js  
- **Encryption:** CryptoJS  
- **2FA:** otplib & QR codes  
- **UI:** Tailwind CSS & React Icons  

---

## Installation & Running Locally

1. **Clone the repository:**

```bash
git clone https://github.com/ish29-code/Madquick.git
cd Madquick/password-generator
```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file in the root with the following:**
   ```bash
   MONGODB_URI=<your_mongo_uri>
   NEXTAUTH_SECRET=<your_nextauth_secret>
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## Build for Production
```bash
npm run build
npm run start

```

---

## Deploy on Render

- Go to [Render](https://render.com/) and create a New Web Service.
- Connect your GitHub repository: [https://github.com/ish29-code/Madquick](https://github.com/ish29-code/Madquick)
- **Set Build Command:**
 ```bash
npm install && npm run build
```

- **Set Start Command:**
```bash
npm run start
```

this is my live url :- [https://madquick-25dg.onrender.com](https://madquick-25dg.onrender.com)

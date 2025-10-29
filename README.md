# 🌐 VERA-S Frontend by Urbane Digital Assets

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

### Infrastructure, Reimagined. (Powered by Solana)

**Solana Program:** [View on Solscan Devnet](https://solscan.io/account/72wg7oHFnghg21VrKqLTFrMvr9BnfHTopAZsX2XyZe8?cluster=devnet)

---

This is the official frontend application for **VERA-S**, the high-performance Solana implementation of the VERA protocol. It transforms municipal revenue bonds into transparent, liquid, and globally accessible digital assets.

This dApp provides a complete, end-to-end user journey, from discovery and verification to investment and portfolio management, all powered by the speed of the Solana network.

### **Core Features**

-   **Professional UI/UX:** A sleek, "frosted glass," and fully responsive dark-themed interface built for a professional fintech experience. It also has a breathing background.
-   **Privacy-Preserving KYC (Frontend-Gated):** A cutting-edge compliance layer using **World ID** for "Proof of Personhood." This is a "smart gate" that checks a user's `localStorage` for a verification flag before enabling the invest functionality, demonstrating a real-world, privacy-first compliance flow.
-   **The "Executive" Dashboard:** A powerful portfolio overview that provides users with a high-level summary of their total investments, blended APY, and a visual asset allocation chart.
-   **The "Glass Cockpit":** Radical transparency with direct links to **Solscan** for all projects, transactions, and assets, providing irrefutable on-chain proof.
-   **Complete Asset Lifecycle:** Users can not only invest (minting SPL tokens) but also manage their assets via a fully functional "Sell / Transfer" modal on their dashboard.

### **Tech Stack**

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Web3:** `@solana/wallet-adapter`, `@solana/web3.js`, `@coral-xyz/anchor`
-   **Styling:** Inline CSS-in-JS & Global CSS
-   **Compliance:** World ID (`IDKit`)
-   **Deployment:** Vercel

### **Running the Project Locally**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/adityar2705/vera-frontend-solana.git](https://github.com/adityar2705/vera-solana-frontend.git)
    ```

2.  **Install dependencies:**
    ```bash
    cd vera-solana-frontend
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---
*A project by Aditya Ranjan for the Solana Cypherpunk Hackathon.*

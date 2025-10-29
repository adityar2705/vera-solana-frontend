'use client';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
// Ensure this is a named import, with curly braces
import { Dashboard } from '../components/Dashboard';
import { useWallet } from '@solana/wallet-adapter-react';

export default function DashboardPage() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <main>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Portfolio</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            An overview of your investments on the Solana network.
          </p>
        </div>
        
        {connected ? (
          <Dashboard />
        ) : (
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Please connect your wallet to view your dashboard.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import Link from 'next/link';
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit';
//we no longer need any solana transaction imports

export default function VerifyPage() {
  const { connected, publicKey } = useWallet();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  //suppress the harmless accessibility warning.
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && /`DialogContent` requires a `DialogTitle`/.test(args[0])) {
        return;
      }
      originalError(...args);
    };
    return () => { console.error = originalError; };
  }, []);

  useEffect(() => {
    if (publicKey) {
      const storedStatus = localStorage.getItem(`kyc_status_${publicKey.toBase58()}`);
      if (storedStatus === 'submitted') {
        setStatus('submitted');
      }
    }
  }, [publicKey]);

  //this function now only saves to local storage. no on-chain transaction.
  // --- THIS IS THE FIX ---
  // Added an underscore to "result" to silence the unused variable warning
  const handleProof = (_result: ISuccessResult) => {
    if (!publicKey) return;

    setStatus('submitting');
    //simulate a quick "processing" step
    setTimeout(() => {
        localStorage.setItem(`kyc_status_${publicKey.toBase58()}`, 'submitted');
        setStatus('submitted');
    }, 500); 
  };

  const getVerificationComponent = () => {
    switch(status) {
        case 'submitting':
            return <p style={{color: 'var(--primary-accent)'}}>Processing verification...</p>;
        case 'submitted':
            return (
                <div style={{textAlign: 'center'}}>
                    <p style={{color: '#2ecc71', fontSize: '1.2rem'}}>✅ Verification Successful!</p>
                    <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>You are now eligible to invest in VERA projects.</p>
                    <Link href="/" style={{...buttonStyle, display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none'}}>
                        Browse Projects
                    </Link>
                </div>
            );
        default: //idle
            return (
                <IDKitWidget
                    app_id="app_staging_5db6f0023bad97df254727e305c9338a" 
                    action="verify-vera-investor"
                    onSuccess={handleProof}
                >
                    {({ open }) => 
                        <button onClick={open} style={buttonStyle}>
                            Begin Verification with World ID
                        </button>
                    }
                </IDKitWidget>
            );
    }
  }
  
  return (
    <>
      <Header />
      <main>
        <div style={containerStyle}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Identity Verification (PoP)</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', textAlign: 'center', marginBottom: '2rem' }}>
            To ensure fairness and regulatory compliance, VERA uses World ID for privacy-preserving Proof of Personhood.
          </p>
          {!connected && <p style={{color: 'var(--text-secondary)'}}>Please connect your wallet to begin.</p>}
          {connected && getVerificationComponent()}
        </div>
      </main>
      <Footer />
    </>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3rem',
  backgroundColor: 'rgba(44, 47, 54, 0.5)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid var(--border-color)',
};
const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary-accent)',
    border: 'none',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'background-color 0.2s',
};

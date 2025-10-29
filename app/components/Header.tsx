'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
});

export function Header() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={logoContainerStyle}>
              <span style={veraLogoStyle}>VERA</span>
              <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '10px', fontSize: '0.9rem' }}>by Urbane Digital Assets</span>
            </div>
          </Link>
          <nav style={{display: 'flex', gap: '1rem'}}>
            <Link href="/dashboard" style={navLinkStyle}>My Portfolio</Link>
            <Link href="/verify" style={navLinkStyle}>Verify Identity</Link>
          </nav>
        </div>
        
        {isClient && (
            <WalletMultiButton style={{ 
                backgroundColor: 'var(--primary-accent)', 
                borderRadius: '8px', 
                height: 'auto',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                lineHeight: '1.5',
            }} />
        )}
      </div>
    </header>
  );
}

// --- STYLES ---
const headerStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem 1.5rem',
  backgroundColor: 'rgba(30, 30, 30, 0.5)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderBottom: '1px solid var(--border-color)',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
};
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};
const logoContainerStyle: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};
const veraLogoStyle: React.CSSProperties = {
  fontFamily: playfair.style.fontFamily,
  fontSize: '1.75rem',
  backgroundImage: 'linear-gradient(45deg, #CFB53B, #E6D3A3)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent',
};
const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  fontSize: '1rem',
  transition: 'color 0.2s',
  padding: '0.5rem',
};
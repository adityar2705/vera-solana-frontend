'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { SolscanLink } from './SolscanLink';

export function ProjectCard({ address, bondData }: { address: PublicKey; bondData: any }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    router.push(`/project/${address.toBase58()}`);
  };

  const totalRaised = bondData.totalRaised.toNumber() / LAMPORTS_PER_SOL;
  const fundingGoal = bondData.fundingGoal.toNumber() / LAMPORTS_PER_SOL;
  const progress = fundingGoal > 0 ? (totalRaised / fundingGoal) * 100 : 0;

  const combinedCardStyle: React.CSSProperties = {
    ...cardStyle,
    transform: isHovered ? 'translateY(-5px)' : 'none',
    borderColor: isHovered ? 'var(--primary-accent)' : 'var(--border-color)',
  };

  return (
    <div 
        style={combinedCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{bondData.name}</h3>
      <p style={{ margin: '4px 0 24px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
        {address.toBase58()} 
        <SolscanLink type="account" address={address.toBase58()} />
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Funding Progress</span>
        <span style={{ fontWeight: 'bold' }}>{progress.toFixed(1)}%</span>
      </div>

      <div style={progressBarContainerStyle}>
        <div style={{ ...progressBarStyle, width: `${progress}%` }}></div>
      </div>
      
      <p style={{ margin: '8px 0 0', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <strong>{totalRaised.toFixed(3)} SOL</strong> / {fundingGoal.toFixed(2)} SOL
      </p>
    </div>
  );
}

// All your beautiful styles are 100% reusable.
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(44, 47, 54, 0.5)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '1.5rem',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  transition: 'transform 0.2s, border-color 0.2s',
  cursor: 'pointer',
};
const progressBarContainerStyle: React.CSSProperties = { 
  width: '100%',
  backgroundColor: 'var(--background-color)',
  borderRadius: '999px',
  height: '12px',
  overflow: 'hidden',
 };
const progressBarStyle: React.CSSProperties = { 
  backgroundColor: 'var(--primary-accent)',
  borderRadius: '999px',
  height: '100%',
  transition: 'width 0.3s ease-in-out',
};
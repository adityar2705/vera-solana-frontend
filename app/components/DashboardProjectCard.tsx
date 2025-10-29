'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolscanLink } from './SolscanLink';
import { TransferModal } from './TransferModal'; 
import { Skeleton } from './Skeleton';

//a 'skeleton' version of the card to show while loading
const DashboardCardSkeleton = () => {
    return (
        <div style={cardStyle}>
            <Skeleton style={{ height: '28px', width: '60%', marginBottom: '8px' }} />
            <Skeleton style={{ height: '16px', width: '80%', marginBottom: '24px' }} />
            <div style={userStatsGridStyle}>
                <Skeleton style={{ height: '40px', width: '100%' }} />
                <Skeleton style={{ height: '40px', width: '100%' }} />
                <Skeleton style={{ height: '40px', width: '100%' }} />
                <Skeleton style={{ height: '40px', width: '100%' }} />
            </div>
            <div style={separatorStyle}></div>
            <div style={managementSectionStyle}>
                <Skeleton style={{ height: '32px', width: '120px' }} />
                <Skeleton style={{ height: '32px', width: '120px' }} />
            </div>
        </div>
    );
};

//a simple tooltip component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <div style={tooltipStyle}>{text}</div>}
    </div>
  );
}

export function DashboardProjectCard({ address, bondData, userTokenBalance }: { address: PublicKey; bondData: any; userTokenBalance: number }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    router.push(`/project/${address.toBase58()}`);
  };
  
  const myTokenBalance = userTokenBalance; 
  const totalRaised = bondData.totalRaised.toNumber() / LAMPORTS_PER_SOL;

  //calculate projected returns on the frontend.
  const interestRate = bondData.interestRate; //e.g., 900
  const projectedReturns = (myTokenBalance * interestRate) / 10000;

  //we pass isLoading as a prop from the main Dashboard component
  if (!bondData) {
    return <DashboardCardSkeleton />;
  }

  return (
    <>
      <div style={{...cardStyle, cursor: 'pointer'}} onClick={handleCardClick}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{bondData.name}</h3>
          <p style={{ margin: '4px 0 24px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
            {address.toBase58()} <SolscanLink type="account" address={address.toBase58()} />
          </p>
          
          <div style={userStatsGridStyle}>
            <div>
                <p style={statLabelStyle}>My Investment (Est.)</p>
                <p style={statValueStyle}>{myTokenBalance.toFixed(3)} SOL</p>
            </div>
            <div>
                <p style={statLabelStyle}>My Tokens</p>
                <p style={statValueStyle}>{myTokenBalance.toFixed(3)} {bondData.symbol}</p>
            </div>
             <div>
                <p style={statLabelStyle}>Projected Yearly Returns (APY)</p>
                {/* --- THIS IS THE FIX --- */}
                <p style={{...statValueStyle, ...gradientTextStyle}}>{projectedReturns.toFixed(4)} SOL</p>
            </div>
            <div>
                <p style={statLabelStyle}>Total Raised</p>
                <p style={statValueStyle}>{totalRaised.toFixed(2)} SOL</p>
            </div>
          </div>
        
        <div style={separatorStyle}></div>
        <div style={managementSectionStyle}>
            <Tooltip text="On-chain revenue distribution and claiming will be enabled in V2 of the protocol.">
                <button style={disabledButtonStyle} onClick={(e) => e.stopPropagation()}>Claim Revenue</button>
            </Tooltip>
            
            <button 
                style={transferButtonStyle} 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            >
                Sell / Transfer
            </button>
        </div>
      </div>

      {isModalOpen && <TransferModal bondMint={bondData.bondMint} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

// --- STYLES ---
const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(44, 47, 54, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
};
const userStatsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const statLabelStyle: React.CSSProperties = { margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' };
const statValueStyle: React.CSSProperties = { margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 };
const separatorStyle: React.CSSProperties = { height: '1px', backgroundColor: 'var(--border-color)', margin: '1.5rem 0' };
const managementSectionStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const transferButtonStyle: React.CSSProperties = { backgroundColor: 'var(--primary-accent)', border: '1px solid var(--primary-accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' };
const disabledButtonStyle: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 500, fontSize: '0.9rem' };
const tooltipStyle: React.CSSProperties = { position: 'absolute', bottom: '125%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(44, 47, 54, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '8px', zIndex: 10, width: '250px', textAlign: 'center', fontSize: '0.875rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', pointerEvents: 'none' };

//this style is now correctly defined
const gradientTextStyle: React.CSSProperties = { 
    backgroundImage: 'linear-gradient(45deg, #CFB53B, #E6D3A3)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent', 
    backgroundClip: 'text', 
    color: 'transparent' 
};
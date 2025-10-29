'use client';

import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { VeraSmartContractSolana } from '../../anchor/vera_smart_contract_solana';
import idl from '../../anchor/idl.json';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolscanLink } from './SolscanLink';
import { Skeleton } from './Skeleton';
import { InvestCard } from './InvestCard'; // 1. Import the new component

// --- YOUR DEPLOYED SOLANA PROGRAM ID ---
const PROGRAM_ID = "72wg7oHFnghg21VrKqLTFrMvr9BnfHTopAZsX2XyZe8";

const DetailsSkeleton = () => (
    <div style={containerStyle}>
        <div style={headerSectionStyle}>
            <Skeleton style={{height: '40px', width: '60%', margin: '0 auto 1rem'}} />
            <Skeleton style={{height: '24px', width: '80%', margin: '0 auto 1rem'}} />
            <Skeleton style={{height: '18px', width: '90%', margin: '0 auto'}} />
        </div>
        <div style={investCardSkeletonStyle}></div>
        <div style={statsGridStyle}>
            <Skeleton style={{height: '80px', width: '100%'}} />
            <Skeleton style={{height: '80px', width: '100%'}} />
            <Skeleton style={{height: '80px', width: '100%'}} />
        </div>
    </div>
);

export function ProjectDetails({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [bondData, setBondData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    return new anchor.Program(idl as any, new PublicKey(PROGRAM_ID), provider) as unknown as anchor.Program<VeraSmartContractSolana>;
  }, [connection, wallet]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!program) return;
      try {
        const data = await program.account.veraBondAccount.fetch(address);
        setBondData(data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
  }, [program, address]);

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!bondData) {
    return <p>Could not load project data. Please check the address and try again.</p>;
  }

  const totalRaised = bondData.totalRaised.toNumber() / LAMPORTS_PER_SOL;
  const fundingGoal = bondData.fundingGoal.toNumber() / LAMPORTS_PER_SOL;
  const progress = fundingGoal > 0 ? (totalRaised / fundingGoal) * 100 : 0;

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{bondData.name}</h1>
        {/* The project description can be added back here if it's in your Solana account struct */}
        <p style={{ fontFamily: 'monospace', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {address.toBase58()}
          <SolscanLink type="account" address={address.toBase58()} />
        </p>
      </div>

      {/* 2. The placeholder is now replaced with our functional InvestCard */}
      <InvestCard bondAccount={address} bondData={bondData} />

      <div style={statsGridStyle}>
        <StatCard title="Funding Progress" value={`${progress.toFixed(1)}%`} />
        <StatCard title="Total Raised" value={`${totalRaised.toFixed(3)} SOL`} />
        <StatCard title="Funding Goal" value={`${fundingGoal.toFixed(2)} SOL`} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div style={statCardStyle}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 600 }}>{value}</p>
    </div>
  );
}

// --- STYLES ---

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '900px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};

const headerSectionStyle: React.CSSProperties = {
  padding: '2rem',
  backgroundColor: 'rgba(44, 47, 54, 0.5)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid var(--border-color)',
  textAlign: 'center',
};

const investCardSkeletonStyle: React.CSSProperties = {
    minHeight: '250px',
    backgroundColor: 'rgba(44, 47, 54, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(44, 47, 54, 0.5)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '1.5rem',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
};
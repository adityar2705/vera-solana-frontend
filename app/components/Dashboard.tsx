'use client';

import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { VeraSmartContractSolana } from '../../anchor/vera_smart_contract_solana';
import idl from '../../anchor/idl.json';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { DashboardProjectCard } from './DashboardProjectCard';
import { PortfolioSummary } from './PortfolioSummary';

const PROGRAM_ID = "72wg7oHFnghg21VrKqLTFrMvr9BnfHTopAZsX2XyZe8";
const CHART_COLORS = ['#007BFF', '#2ECC71', '#FFC107', '#E83E8C', '#17A2B8'];

// Ensure this component is correctly exported
export function Dashboard() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalProjectedReturn, setTotalProjectedReturn] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const program = useMemo(() => {
    if (!connection || !publicKey) return null;
    const provider = new anchor.AnchorProvider(connection, {publicKey} as anchor.Wallet, { commitment: "confirmed" });
    return new anchor.Program(idl as any, new PublicKey(PROGRAM_ID), provider) as unknown as anchor.Program<VeraSmartContractSolana>;
  }, [connection, publicKey]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!program || !publicKey) {
        if (!publicKey) setIsLoading(false);
        return;
      }
      try {
        const allBonds = await program.account.veraBondAccount.all();
        const ownedBonds = [];
        let tempTotalInvested = 0;
        let tempTotalProjectedReturn = 0;
        const tempChartData = [];

        for (const bond of allBonds) {
          const investorAta = getAssociatedTokenAddressSync(bond.account.bondMint, publicKey);
          try {
            const tokenAccount = await connection.getTokenAccountBalance(investorAta);
            if (tokenAccount.value.uiAmount && tokenAccount.value.uiAmount > 0) {
              const userBalance = tokenAccount.value.uiAmount;
              ownedBonds.push({ ...bond, userTokenBalance: userBalance });
              
              tempTotalInvested += userBalance;
              const projectedReturn = (userBalance * bond.account.interestRate) / 10000;
              tempTotalProjectedReturn += projectedReturn;
              
              tempChartData.push({
                label: bond.account.name.split(' ')[0],
                value: userBalance,
                color: CHART_COLORS[ownedBonds.length % CHART_COLORS.length]
              });
            }
          } catch (e) {}
        }
        setPortfolio(ownedBonds);
        setTotalInvested(tempTotalInvested);
        setTotalProjectedReturn(tempTotalProjectedReturn);
        setChartData(tempChartData);

      } catch (error) {
        console.error("failed to fetch portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [program, publicKey, connection]);

  if (isLoading) {
    return <p style={{textAlign: 'center'}}>Scanning the blockchain for your investments...</p>;
  }

  return (
    <>
      <PortfolioSummary 
        totalInvested={totalInvested} 
        projectedReturn={totalProjectedReturn} 
        chartData={chartData} 
      />
      
      <div style={assetsContainerStyle}>
        <h2 style={assetsHeaderStyle}>My Assets</h2>
        
        <div style={assetsGridStyle}>
            {portfolio.length > 0 ? (
            portfolio.map((bond) => (
                <DashboardProjectCard 
                    key={bond.publicKey.toBase58()} 
                    address={bond.publicKey}
                    bondData={bond.account}
                    userTokenBalance={bond.userTokenBalance}
                />
            ))
            ) : (
            <div style={emptyStateStyle}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    You have not invested in any projects yet.
                </p>
            </div>
            )}
        </div>
      </div>
    </>
  );
}

// --- STYLES ---
const assetsContainerStyle: React.CSSProperties = { width: '100%', maxWidth: '900px', margin: '3rem auto 0' };
const assetsHeaderStyle: React.CSSProperties = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', paddingBottom: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' };
const assetsGridStyle: React.CSSProperties = { display: 'grid', gap: '2rem' };
const emptyStateStyle: React.CSSProperties = { padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(44, 47, 54, 0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid var(--border-color)' };
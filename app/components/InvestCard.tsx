'use client';

import { useState, useMemo, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { VeraSmartContractSolana } from '../../anchor/vera_smart_contract_solana';
import idl from '../../anchor/idl.json';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { SolscanLink } from './SolscanLink';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Link from 'next/link';

const PROGRAM_ID = "72wg7oHFnghg21VrKqLTFrMvr9BnfHTopAZsX2XyZe8";

export function InvestCard({ bondAccount, bondData }: { bondAccount: PublicKey, bondData: any }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  // --- THIS IS THE "FRONTEND GATE" ---
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(true);

  const program = useMemo(() => {
    if (!connection || !wallet.publicKey) return null;
    const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    return new anchor.Program(idl as any, new PublicKey(PROGRAM_ID), provider) as unknown as anchor.Program<VeraSmartContractSolana>;
  }, [connection, wallet]);

  useEffect(() => {
    if (publicKey) {
        //check local storage instead of the blockchain.
        const storedStatus = localStorage.getItem(`kyc_status_${publicKey.toBase58()}`);
        if (storedStatus === 'submitted') {
            setIsWhitelisted(true);
        } else {
            setIsWhitelisted(false);
        }
    } else {
        setIsWhitelisted(false);
    }
    setIsLoadingWhitelist(false);
  }, [publicKey]);
  // --- END OF GATE ---

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!program || !publicKey || !sendTransaction || !amount) return;

    setIsSubmitting(true);
    setError('');
    setSignature('');

    try {
      const lamports = new anchor.BN(parseFloat(amount) * LAMPORTS_PER_SOL);
      const investorAta = getAssociatedTokenAddressSync(bondData.bondMint, publicKey);
      const [mintAuthorityPda] = PublicKey.findProgramAddressSync([Buffer.from("vera_mint_authority")], program.programId);
      
      //we use the original `invest` function from our simple contract.
      //it does not require any whitelist pda.
      const tx = await program.methods
        .invest(lamports)
        .accounts({
          bondAccount: bondAccount,
          bondMint: bondData.bondMint,
          investorTokenAccount: investorAta,
          investor: publicKey,
          authority: bondData.authority,
          mintAuthority: mintAuthorityPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .transaction();
      
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      setSignature(signature);
    } catch (err: any) {
      console.error("Investment failed:", err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!publicKey) {
    return <div style={investCardStyle}><p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Please connect your wallet to invest.</p></div>;
  }
  if (isLoadingWhitelist) {
    return <div style={investCardStyle}><p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Checking your verification status...</p></div>;
  }
  
  //this is the new "smart gate".
  if (!isWhitelisted) {
    return (
      <div style={investCardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>Verification Required</h3>
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6}}>
              You must verify your identity before you can invest.
          </p>
          <Link href="/verify" style={{...buttonStyle, display: 'inline-block', textDecoration: 'none', marginTop: '1rem', textAlign: 'center', width: '100%'}}>
            Go to Verification
          </Link>
      </div>
    );
  }
  
  //if the user is "whitelisted" (in local storage), show the invest form.
  return (
    <div style={investCardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Invest in this Project</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="amount" style={labelStyle}>Amount (SOL)</label>
          <input id="amount" type="number" step="0.01" min="0" onChange={(e) => setAmount(e.target.value)} placeholder="0.5" value={amount} style={inputStyle} required />
        </div>
        <button type="submit" disabled={isSubmitting || !amount} style={isSubmitting || !amount ? {...buttonStyle, ...buttonDisabledStyle} : buttonStyle}>
          {isSubmitting ? 'Processing Transaction...' : 'Invest Now'}
        </button>
      </form>
      {signature && (
        <div style={{...feedbackStyle, border: '1px solid #2ecc71'}}>
            <p>🎉 Investment Confirmed!</p>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem'}}>
                {signature.slice(0, 6)}...{signature.slice(-4)} <SolscanLink type="tx" address={signature} />
            </div>
        </div>
      )}
      {error && (
        <div style={{...feedbackStyle, color: '#ff6b6b', border: '1px solid #ff6b6b'}}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const investCardStyle: React.CSSProperties = { backgroundColor: 'rgba(44, 47, 54, 0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '2rem' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-color)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' };
const buttonStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-accent)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' };
const buttonDisabledStyle: React.CSSProperties = { backgroundColor: 'var(--border-color)', cursor: 'not-allowed', opacity: 0.6 };
const feedbackStyle: React.CSSProperties = { marginTop: '1.5rem', textAlign: 'center', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' };
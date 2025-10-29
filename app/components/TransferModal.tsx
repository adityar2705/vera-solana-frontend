'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddressSync, 
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction, 
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { SolscanLink } from './SolscanLink';

export function TransferModal({ bondMint, onClose }: { bondMint: PublicKey; onClose: () => void; }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!publicKey || !amount || !recipient) return;

    setIsSubmitting(true);
    setError('');
    setSignature('');

    try {
        const recipientPubkey = new PublicKey(recipient);

        // Fetch the mint account to determine which token program to use
        const mintAccountInfo = await connection.getAccountInfo(bondMint);
        if (!mintAccountInfo) {
          throw new Error('Mint account not found');
        }

        // Determine if this is Token-2022 or standard Token Program
        const tokenProgramId = mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID) 
          ? TOKEN_2022_PROGRAM_ID 
          : TOKEN_PROGRAM_ID;

        // Get mint info to fetch decimals
        const mintInfo = await connection.getParsedAccountInfo(bondMint);
        const decimals = (mintInfo.value?.data as any)?.parsed?.info?.decimals ?? 9;
        
        // Convert amount to token's smallest unit using the correct decimals
        const tokenAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

        // Get the source and destination token accounts
        const sourceAta = getAssociatedTokenAddressSync(
          bondMint, 
          publicKey,
          false,
          tokenProgramId
        );
        
        const destAta = getAssociatedTokenAddressSync(
          bondMint, 
          recipientPubkey,
          false,
          tokenProgramId
        );
        
        const transaction = new Transaction();

        // Check if the destination account exists
        let destAccountExists = false;
        try {
            await getAccount(connection, destAta, 'confirmed', tokenProgramId);
            destAccountExists = true;
        } catch (error: any) {
            // Account doesn't exist, we'll need to create it
            if (error.name === "TokenAccountNotFoundError" || 
                error.message?.includes("could not find account") ||
                error.message?.includes("Invalid account owner")) {
                destAccountExists = false;
            } else {
                throw error;
            }
        }

        // If destination doesn't exist, create it first
        if (!destAccountExists) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    publicKey,      // Payer
                    destAta,        // ATA address
                    recipientPubkey, // Owner
                    bondMint,       // Mint
                    tokenProgramId  // Token program
                )
            );
        }

        // Use transferChecked for better safety (includes decimals and mint verification)
        transaction.add(
            createTransferCheckedInstruction(
                sourceAta,      // Source account
                bondMint,       // Mint
                destAta,        // Destination account
                publicKey,      // Owner of source account
                tokenAmount,    // Amount
                decimals,       // Decimals
                [],             // No additional signers needed
                tokenProgramId  // Token program
            )
        );

        // Send and confirm transaction
        const sig = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        await connection.confirmTransaction(sig, 'confirmed');
        setSignature(sig);

    } catch (err: any) {
      console.error("Transfer failed:", err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Transfer Asset</h3>
            <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        </div>
        
        <form onSubmit={submit} style={{marginTop: '1.5rem'}}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="recipient" style={labelStyle}>Recipient Address</label>
            <input 
              id="recipient" 
              type="text" 
              onChange={(e) => setRecipient(e.target.value)} 
              placeholder="Enter Solana Address..." 
              value={recipient} 
              style={inputStyle} 
              required 
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="amount" style={labelStyle}>Amount of Tokens</label>
            <input 
              id="amount" 
              type="number" 
              step="any" 
              min="0" 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.0" 
              value={amount} 
              style={inputStyle} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !amount || !recipient} 
            style={isSubmitting || !amount || !recipient ? {...buttonStyle, ...buttonDisabledStyle} : buttonStyle}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </form>

        {signature && (
            <div style={{...feedbackStyle, border: '1px solid #2ecc71'}}>
                <p>🎉 Transfer Confirmed!</p>
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
    </div>
  );
}

// Styles
const overlayStyle: React.CSSProperties = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  backgroundColor: 'rgba(18, 18, 18, 0.5)', 
  backdropFilter: 'blur(10px)', 
  WebkitBackdropFilter: 'blur(10px)', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  zIndex: 1000 
};

const modalStyle: React.CSSProperties = { 
  backgroundColor: 'rgba(44, 47, 54, 0.8)', 
  borderRadius: '16px', 
  padding: '2rem', 
  border: '1px solid var(--border-color)', 
  width: '100%', 
  maxWidth: '500px', 
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
};

const closeButtonStyle: React.CSSProperties = { 
  background: 'none', 
  border: 'none', 
  color: 'var(--text-secondary)', 
  fontSize: '1.5rem', 
  cursor: 'pointer' 
};

const labelStyle: React.CSSProperties = { 
  display: 'block', 
  marginBottom: '0.5rem', 
  color: 'var(--text-secondary)' 
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '0.75rem 1rem', 
  borderRadius: '8px', 
  border: '1px solid var(--border-color)', 
  backgroundColor: 'var(--background-color)', 
  color: 'var(--text-primary)', 
  fontSize: '1rem', 
  outline: 'none' 
};

const buttonStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '0.75rem 1rem', 
  borderRadius: '8px', 
  border: 'none', 
  backgroundColor: 'var(--primary-accent)', 
  color: 'white', 
  fontSize: '1rem', 
  fontWeight: 600, 
  cursor: 'pointer' 
};

const buttonDisabledStyle: React.CSSProperties = { 
  backgroundColor: 'var(--border-color)', 
  cursor: 'not-allowed', 
  opacity: 0.6 
};

const feedbackStyle: React.CSSProperties = { 
  marginTop: '1.5rem', 
  textAlign: 'center', 
  padding: '1rem', 
  borderRadius: '8px', 
  backgroundColor: 'var(--surface-color)', 
  border: '1px solid var(--border-color)' 
};
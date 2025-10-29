'use client';

import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { VeraSmartContractSolana } from '../../anchor/vera_smart_contract_solana';
import idl from '../../anchor/idl.json';
import { ProjectCard } from './ProjectCard';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = "72wg7oHFnghg21VrKqLTFrMvr9BnfHTopAZsX2XyZe8"; 

export function ProjectList() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const program = useMemo(() => {
    if (!connection || !wallet.publicKey) {
      return null;
    }

    const provider = new anchor.AnchorProvider(
      connection, 
      wallet as any, 
      { commitment: "confirmed" }
    );
    
    const program = new anchor.Program<VeraSmartContractSolana>(
      idl as unknown as VeraSmartContractSolana,
      new PublicKey(PROGRAM_ID),
      provider
    );

    return program;
  }, [connection, wallet]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!program) {
        if (!wallet.publicKey) setIsLoading(false); 
        return;
      }

      try {
        const fetchedAccounts = await program.account.veraBondAccount.all();
        setProjects(fetchedAccounts);
      } catch (error) {
        console.error("error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [program, wallet.publicKey]);

  if (isLoading) {
    return <p>loading projects from solana devnet...</p>;
  }

  return (
    <div style={{
      display: 'grid',
      gap: '2rem',
      width: '100%',
      maxWidth: '800px',
    }}>
      {projects && projects.length > 0 ? (
        projects.map(({ publicKey, account }) => (
          <ProjectCard key={publicKey.toBase58()} address={publicKey} bondData={account} />
        ))
      ) : (
        <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
          No active projects found.
        </p>
      )}
    </div>
  );
}
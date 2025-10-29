'use client';

import { useParams } from 'next/navigation';
import { Header } from './../../components/Header';
import { Footer } from './../../components/Footer';
import { ProjectDetails } from './../../components/ProjectDetails'; // We will create this next
import { PublicKey } from '@solana/web3.js';

export default function ProjectPage() {
  const params = useParams();
  
  const addressString = Array.isArray(params.address) ? params.address[0] : params.address;
  let projectAddress: PublicKey | null = null;
  
  try {
    if (addressString) {
      projectAddress = new PublicKey(addressString);
    }
  } catch (error) {
    console.error("Invalid project address from URL:", error);
  }

  return (
    <>
      <Header />
      <main>
        {projectAddress ? (
          <ProjectDetails address={projectAddress} />
        ) : (
          <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Invalid project address provided.</p>
        )}
      </main>
      <Footer />
    </>
  );
}


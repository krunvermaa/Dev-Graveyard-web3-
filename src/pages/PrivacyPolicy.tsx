import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, Cpu } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in text-zinc-300">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to DevGraveyard Sanctuary</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#c53030]/10 border border-[#c53030]/30 text-[#c53030]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
              DevGraveyard Web3 • Avalanche C-Chain
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#c53030]" />
          1. Our Core Privacy & Decentralization Promise
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          DevGraveyard was created by developers for developers. We treat your code, identity, and failures with the highest respect. We operate under strict principles: we do not sell your personal data, we do not inspect or clone private repositories, and we request zero custodial access to your Web3 private keys or crypto assets.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-[#c53030]" />
          2. Web3 Wallet Connection & Identity
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          Authentication on DevGraveyard Web3 uses your non-custodial cryptographic wallet (such as Core, MetaMask, or Rabby) connected to Avalanche C-Chain or Fuji Testnet.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-400 font-sans">
          <li><strong>Zero Private Key Access:</strong> We never see, transmit, or store your private key or seed phrase. Transactions are signed locally in your wallet.</li>
          <li><strong>Pseudonymous Public Address:</strong> Your public wallet address (0x...) serves as your immutable identifier for on-chain memorial ownership.</li>
          <li><strong>Optional GitHub Picker:</strong> The optional GitHub repository picker merely fetches your public repo names and stars so you can memorialize them without manual copy-pasting.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-[#c53030]" />
          3. Memorial Data & Smart Contract Storage
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          When you conduct a burial ritual, the project name, cause of death, lessons learned, and respects counter are recorded on Avalanche C-Chain smart contracts and distributed storage.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-400 font-sans">
          <li><strong>Public Cemetery:</strong> Graves in the cemetery are public documents meant to educate the broader developer community.</li>
          <li><strong>Unmarked Graves:</strong> If you select "Unmarked Grave", your wallet address and username are hidden on the tombstone card.</li>
          <li><strong>Epitaph Immutability:</strong> Memorials committed to the blockchain enjoy censorship-resistant permanence.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#c53030]" />
          4. Anonymous Confessions & AI Post-Mortems
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          Confessions posted to the Wall of Developer Regret are stored without user identity. Our AI Post-Mortem assistant uses client-side heuristic evaluation or serverless proxy models where no proprietary user source code or credentials are ever logged.
        </p>
      </section>

      <section className="space-y-4 border-t border-zinc-800 pt-6">
        <h2 className="font-mono text-lg font-semibold text-white">
          5. Contact & Open Source Audits
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          DevGraveyard is completely open source. You can audit all smart contracts, UI components, and cryptographic flows directly on GitHub.
        </p>
      </section>
    </article>
  );
};

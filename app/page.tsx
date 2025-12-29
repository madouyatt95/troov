import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-area-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4361ee] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="font-bold text-xl gradient-text">TROOV</span>
        </div>
        <select
          className="bg-transparent text-[#a0a0b9] text-sm border border-[#3a3a50] rounded-lg px-2 py-1"
          defaultValue="fr"
        >
          <option value="fr">FR</option>
          <option value="wo">Wolof</option>
          <option value="en">EN</option>
        </select>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 animate-fade-in">
        {/* Logo and tagline */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#4361ee] to-[#4cc9f0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4361ee]/30">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Bienvenue sur Troov</h1>
          <p className="text-[#a0a0b9]">Retrouvez vos documents en toute sécurité</p>
        </div>

        {/* Action cards */}
        <div className="w-full max-w-md space-y-4">
          {/* Finder CTA */}
          <Link href="/finder" className="block">
            <Card variant="interactive" className="border-l-4 border-l-[#4cc9f0]">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4cc9f0]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">J&apos;ai TROUVÉ un document</h2>
                  <p className="text-sm text-[#a0a0b9]">Déclarer sans inscription</p>
                </div>
                <svg className="w-5 h-5 text-[#a0a0b9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </CardContent>
            </Card>
          </Link>

          {/* Owner CTA */}
          <Link href="/login" className="block">
            <Card variant="interactive" className="border-l-4 border-l-[#4361ee]">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4361ee]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔍</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">J&apos;ai PERDU mon document</h2>
                  <p className="text-sm text-[#a0a0b9]">M&apos;inscrire pour être alerté</p>
                </div>
                <svg className="w-5 h-5 text-[#a0a0b9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </CardContent>
            </Card>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#3a3a50]"></div>
            <span className="text-sm text-[#6b6b80]">ou</span>
            <div className="flex-1 h-px bg-[#3a3a50]"></div>
          </div>

          {/* Track status CTA */}
          <Link href="/status">
            <Button variant="outline" className="w-full">
              <span className="mr-2">📊</span>
              Suivre ma déclaration
            </Button>
          </Link>
        </div>
      </div>

      {/* Security badge */}
      <footer className="p-6 safe-area-bottom">
        <div className="flex items-center justify-center gap-2 text-sm text-[#6b6b80]">
          <span className="text-[#4ade80]">🔒</span>
          <span>Vos données sont protégées</span>
        </div>
        <p className="text-center text-xs text-[#4a4a60] mt-1">
          Aucune info visible publiquement
        </p>
      </footer>
    </main>
  );
}

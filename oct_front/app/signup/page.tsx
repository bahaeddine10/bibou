'use client';

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matricule, setMatricule] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              signup(
                email: "${email}",
                password: "${password}",
                matricule: "${matricule}"
              ) {
                access_token
                token_type
                expires_in
                user {
                  id
                  nom
                  prenom
                  email
                  matricule
                }
              }
            }
          `,
        }),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur réseau: ${errorText}`);
      }
  
      const data = await res.json();
  
      if (data.errors) {
        {/*console.error('Échec de l\'inscription:', data.errors);*/}
        setError('Échec de l\'inscription. Veuillez réessayer.');
        return;
      }
  
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fond avec image et overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/images/oct_logo1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-[#004571]/90 backdrop-blur-sm"></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-white/20">
            <div className="text-center mb-4">
              <Image
                src="/images/oct_logo1.png"
                alt="Logo OCT"
                width={150}
                height={38}
                className="mx-auto mb-2"
                priority
              />
              <h1 className="text-xl font-bold text-[#004571]">
                Office de Commerce de la Tunisie
              </h1>
              <p className="text-xs text-gray-600">
                Unité Informatique - Espace agent
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-3 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors text-sm bg-white/80"
                  placeholder="Email"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors text-sm bg-white/80"
                  placeholder="Mot de passe"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  required
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors text-sm bg-white/80"
                  placeholder="Matricule"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#004571] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#003a5e] transition-colors"
              >
                S&apos;inscrire
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/" className="font-medium text-[#004571] hover:text-[#003a5e]">
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Office de Commerce de la Tunisie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
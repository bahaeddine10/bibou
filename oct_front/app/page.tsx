'use client'; // Add this directive at the top of the file

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("🔐 GraphQL login password:", password);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
      remember: rememberMe,
    });
    
    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      window.location.href = '/dashboard';
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-500 focus:ring-[#004571] focus:border-transparent transition-colors text-sm bg-white/80"
                  placeholder="Mot de passe"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3 w-3 text-[#004571] focus:ring-[#004571] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#004571] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#003a5e] transition-colors"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/signup" className="font-medium text-[#004571] hover:text-[#003a5e]">
                  S&apos;inscrire
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
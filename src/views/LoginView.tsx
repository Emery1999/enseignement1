import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { motion } from 'motion/react';
import { ArrowRight, BookHeadphones, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email);
      toast.success('Connexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#140d06] font-sans">
      {/* Panneau gauche : Branding */}
      <div className="w-full md:w-[46%] min-h-[200px] flex-shrink-0 bg-gradient-to-br from-[#1a1209] via-[#231510] to-[#140d06] relative overflow-hidden flex flex-col justify-center items-center px-10 text-center">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-[#E63946] opacity-10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-white opacity-5 blur-[80px] rounded-full"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <div className="mx-auto w-16 h-16 bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] shadow-[0_4px_20px_rgba(230,57,70,0.35)] rounded-2xl flex items-center justify-center mb-6">
            <BookHeadphones size={32} />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
            Enseignements
          </h1>
          <p className="text-[#9ca3b8] max-w-sm mx-auto text-sm lg:text-base leading-relaxed">
            La plateforme d'écoute et de gestion de vos formations et thèmes favoris.
          </p>
        </motion.div>
      </div>

      {/* Panneau droit : Formulaire */}
      <div className="flex-1 bg-white md:rounded-l-[26px] z-10 flex flex-col justify-center shadow-[-10px_0_40px_rgba(0,0,0,0.15)] overflow-y-auto">
        <div className="w-full max-w-[460px] mx-auto px-8 py-12 md:py-20 lg:px-12 animate-slide-in">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-[1.65rem] font-extrabold text-gray-900 tracking-tight mb-2">Bienvenue</h2>
            <p className="text-[#9ca3b8] text-sm">Connectez-vous à votre espace personnel.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input focus:border-[#E63946] focus:ring-[#E63946]"
                  style={{ paddingLeft: '2.8rem', borderRadius: '14px' }}
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="login-btn w-full flex justify-center items-center text-white disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? 'Connexion en cours...' : 'Accéder à mon espace'}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-[0.75rem] text-gray-400 space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="font-semibold text-gray-700">Comptes de démonstration</p>
            <p><strong className="text-gray-600">Admin :</strong> admin@example.com</p>
            <p><strong className="text-gray-600">Utilisateur :</strong> tout autre email</p>
          </div>
        </div>
      </div>
    </div>
  );
}

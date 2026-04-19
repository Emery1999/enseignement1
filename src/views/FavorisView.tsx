import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import { Link } from 'react-router-dom';
import { Heart, Headphones, Calendar, ArrowRight, Filter } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function FavorisView() {
  const { user } = useAuthStore();
  const [favoris, setFavoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'popularite'

  useEffect(() => {
    setLoading(true);
    api.getFavoris(user?.email).then(data => {
      // Sort logic
      let items = Array.isArray(data) ? [...data] : [];
      if (sortBy === 'popularite') {
        items.sort((a: any, b: any) => b.listenCount - a.listenCount);
      } else {
        items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      setFavoris(items);
      setLoading(false);
    }).catch(() => {
      setFavoris([]);
      setLoading(false);
    });
  }, [sortBy, user?.email]);

  if (loading && favoris.length === 0) {
    return <div className="view-container animate-pulse-soft font-medium text-gray-500">Chargement de vos favoris...</div>;
  }

  return (
    <div className="view-container max-w-6xl mx-auto flex flex-col gap-8">
      <header className="view-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="view-title animate-fade-in">
              Vos Favoris
            </h1>
           </div>
          <p className="view-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>Retrouvez rapidement vos enseignements marqués d'un coeur.</p>
        </div>
        
        <div className="filter-bar flex items-center gap-2 px-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Filter size={14} className="text-gray-400 ml-2" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select bg-transparent outline-none border-none pl-2 pr-8"
          >
            <option value="date">Plus récents</option>
            <option value="popularite">Plus écoutés</option>
          </select>
        </div>
      </header>

      {favoris.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-100 rounded-[26px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
           <Heart size={48} className="mx-auto text-gray-200 mb-6" />
           <h3 className="text-[1.25rem] font-bold text-gray-800 tracking-tight">Aucun favori</h3>
           <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">Vous n'avez pas encore ajouté d'enseignements à vos favoris. Parcourez les thèmes pour commencer.</p>
           <Link to="/themes" className="btn-primary inline-flex items-center mt-8">Explorer les thèmes <ArrowRight size={16} className="ml-2" /></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {favoris.map((ens, idx) => (
            <motion.div 
              key={ens.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <Link to={`/enseignements/${ens.id}`} className="bg-white p-4 px-6 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-card hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full shrink-0 bg-[#E63946] shadow-[0_0_8px_rgba(230,57,70,0.4)]"></div>
                  <div>
                    <div className="font-bold text-[1.05rem] text-gray-800 group-hover:text-[#E63946] transition-colors">
                      {ens.title}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-1 font-medium tracking-[0.01em]">
                      Date : {formatDate(ens.date)} <span className="mx-1.5 opacity-50">•</span> {ens.listenCount} écoutes
                    </div>
                  </div>
                </div>
                <div className="btn-secondary px-5">
                  Ouvrir
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

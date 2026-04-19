import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import { Link } from 'react-router-dom';
import { Layers, Heart, Headphones, Book } from 'lucide-react';

export function DashboardView() {
  const { user, login } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDashboardStats()
      .then((data) => {
        setDashboardData(data);
        
        // Sync role from DB to memory state only
        if (data?.user && data.user.role !== user?.role) {
          useAuthStore.setState({ user: data.user });
        }
      })
      .catch(error => {
        console.error("Erreur chargement dashboard:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.email]);

  const kpis = dashboardData?.stats || dashboardData; // Support both nested & flat structures for counts
  const recentEnseignements = dashboardData?.recentEnseignements || [];
  const themeDistribution = dashboardData?.themeDistribution || [];

  const statCards = [
    { 
      label: 'Enseignements', 
      value: kpis?.totalEnseignements ?? 0, 
      icon: Book,
      bg: 'bg-blue-50', text: 'text-blue-600', ring: 'rgba(37,99,235,0.12)', glow: 'rgba(37,99,235,0.08)'
    },
    { 
      label: 'Thèmes Actifs', 
      value: kpis?.totalThemes ?? 0, 
      icon: Layers,
      bg: 'bg-purple-50', text: 'text-purple-600', ring: 'rgba(147,51,234,0.12)', glow: 'rgba(147,51,234,0.08)'
    },
    { 
      label: 'Total Écoutes', 
      value: kpis?.totalEcoutes ?? 0, 
      icon: Headphones,
      bg: 'bg-green-50', text: 'text-green-600', ring: 'rgba(22,163,74,0.12)', glow: 'rgba(22,163,74,0.08)'
    },
    { 
      label: 'Favoris', 
      value: kpis?.favorisCount ?? 0, 
      icon: Heart,
      bg: 'bg-red-50', text: 'text-red-600', ring: 'rgba(220,38,38,0.12)', glow: 'rgba(220,38,38,0.08)'
    },
  ];

  if (loading) {
    return (
      <div className="view-container space-y-8 animate-pulse-soft">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {[1,2,3,4].map(i => <div key={i} className="kpi-card h-32 bg-white"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container max-w-7xl mx-auto flex flex-col gap-8">
      <div className="view-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="view-title animate-fade-in">
            Tableau de Bord
          </h1>
          <p className="view-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Bienvenue, {user?.email.split('@')[0]} — {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </p>
        </div>
        <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {user?.role === 'admin' && (
            <div className="bg-[#FFE5E8] text-[#E63946] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border border-[#E63946]/20">
              Admin Mode
            </div>
          )}
        </div>
      </div>

      {/* STATS HEADER */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="kpi-card animate-scale-in group overflow-hidden relative"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500">
                <Icon size={80} />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className={`${stat.bg} p-3.5 rounded-2xl ${stat.text} shadow-sm`}
                  style={{ boxShadow: `0 0 0 6px ${stat.ring}, 0 4px 12px ${stat.glow}` }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                <h3 className="text-[1.6rem] font-extrabold text-gray-900 leading-tight tracking-tight">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid md:grid-cols-[2fr_1fr] gap-6 flex-grow">
        {/* LATEST ENSEIGNEMENTS (DATA CARD) */}
        <section className="data-card overflow-hidden animate-fade-in flex flex-col" style={{ animationDelay: '0.3s' }}>
          <div className="data-card-header">
            <h2 className="font-bold text-gray-800 text-base">Derniers Enseignements</h2>
            <Link to="/themes" className="text-xs font-semibold text-[#E63946] hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="overflow-x-auto flex-1 h-full bg-white">
            <table className="w-full premium-table">
              <thead>
                <tr>
                  <th>Titre & Description</th>
                  <th>Écoutes</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentEnseignements.map((ens: any, idx: number) => {
                  const themeColors = ['#E63946', '#2563EB', '#16A34A', '#D97706'];
                  const color = themeColors[idx % themeColors.length];
                  return (
                    <tr key={ens.id}>
                      <td>
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                           <div>
                               <p className="font-semibold text-gray-900">{ens.title}</p>
                             <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] sm:max-w-xs truncate" 
                                dangerouslySetInnerHTML={{ __html: ens.description?.replace(/<[^>]+>/g, '').substring(0, 45).trim() + (ens.description?.length > 45 ? '...' : '') }}
                             />
                           </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{ens.listenCount}</span>
                      </td>
                      <td className="text-right">
                        <Link to={`/enseignements/${ens.id}`} className="btn-secondary whitespace-nowrap text-xs py-1.5 px-3">
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* DISTRIBUTION TWEAKS */}
        <section className="data-card animate-fade-in flex flex-col" style={{ animationDelay: '0.4s' }}>
          <div className="data-card-header">
            <h2 className="font-bold text-gray-800 text-base">Répartition</h2>
            <span className="text-xs text-gray-400">{themeDistribution.length} thèmes</span>
          </div>
          <div className="p-6 flex-grow flex flex-col gap-5 bg-white">
             {themeDistribution.map((dist: any, idx: number) => {
               const maxCount = Math.max(...themeDistribution.map((d: any) => d.count), 1);
               const percent = (dist.count / maxCount) * 100;
               const themeColors = ['#E63946', '#2563EB', '#16A34A', '#9333EA'];
               const color = themeColors[idx % themeColors.length];
               return (
                <div key={dist.name} className="flex flex-col">
                  <div className="flex justify-between text-[13px] font-medium text-gray-700 mb-2">
                    <span>{dist.name}</span>
                    <span className="text-gray-500 font-mono text-xs">{dist.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
                    />
                  </div>
                </div>
               )
             })}
          </div>
        </section>
      </div>
    </div>
  );
}

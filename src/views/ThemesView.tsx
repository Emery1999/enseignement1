import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import { Folder, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ThemesView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6' });

  const fetchThemes = () => {
    setLoading(true);
    api.getThemes().then(data => {
      setThemes(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const openAddModal = () => {
    setEditingTheme(null);
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setIsModalOpen(true);
  };

  const openEditModal = (e: any, theme: any) => {
    e.preventDefault();
    setEditingTheme(theme);
    setFormData({ name: theme.name, description: theme.description, color: theme.color });
    setIsModalOpen(true);
  };

  const handleDelete = async (e: any, id: string) => {
    e.preventDefault();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce thème ?")) return;
    try {
      await api.deleteTheme(id);
      toast.success("Thème supprimé");
      fetchThemes();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      if (editingTheme) {
        await api.updateTheme(editingTheme.id, formData);
        toast.success("Thème mis à jour");
      } else {
        await api.createTheme(formData);
        toast.success("Thème créé");
      }
      setIsModalOpen(false);
      fetchThemes();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  if (loading && themes.length === 0) {
    return (
      <div className="view-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse-soft">
        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-200 rounded-[20px]"></div>)}
      </div>
    );
  }

  return (
    <div className="view-container max-w-7xl mx-auto flex flex-col gap-8">
      <header className="view-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="view-title animate-fade-in">
            Thèmes
          </h1>
          <p className="view-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>Parcourez les catégories d'enseignements</p>
        </div>
        {isAdmin && (
          <button onClick={openAddModal} className="btn-primary animate-fade-in flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau thème</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {themes.map((theme, idx) => (
            <motion.div
              layout
              key={theme.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              <Link to={`/themes/${theme.id}`} className="block h-full">
                <div className="bg-white h-full rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-200 flex flex-col relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4 z-10">
                    <div 
                      className="h-10 w-10 rounded-2xl text-white flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: theme.color, boxShadow: `0 0 0 6px ${theme.color}20, 0 4px 12px ${theme.color}30` }}
                    >
                      <Folder size={20} />
                    </div>
                    
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={(e) => openEditModal(e, theme)}
                           className="p-2 text-gray-400 hover:text-[#E63946] bg-slate-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                           onClick={(e) => handleDelete(e, theme.id)}
                           className="p-2 text-gray-400 hover:text-red-600 bg-slate-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 z-10 flex flex-col gap-2">
                    <h3 className="text-[1.15rem] font-bold text-gray-800">{theme.name}</h3>
                    <p className="text-gray-500 text-[13px] line-clamp-2 leading-relaxed">{theme.description}</p>
                  </div>
                  
                  <div className="mt-5 z-10">
                     <span className="inline-flex items-center justify-center bg-gray-50 text-gray-600 text-[0.72rem] font-bold px-3 py-1.5 rounded-full tracking-[0.02em]">
                       {theme.count} enseignements
                     </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingTheme ? 'Modifier le thème' : 'Nouveau thème'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="form-label">Nom du thème</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="Ex: Sagesse" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-input resize-none" placeholder="Description du thème..."></textarea>
              </div>
              <div>
                <label className="form-label">Couleur</label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 overflow-hidden rounded-[12px] border-2 border-gray-100 shrink-0 shadow-sm cursor-pointer" style={{ backgroundColor: formData.color }}>
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer" />
                  </div>
                  <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="form-input font-mono uppercase flex-1" />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

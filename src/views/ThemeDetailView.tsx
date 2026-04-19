import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import { ChevronLeft, Plus, Trash2, X, Link2, Headphones, FileText, Type, AlignLeft, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function ThemeDetailView() {
  const { themeId } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [enseignements, setEnseignements] = useState<any[]>([]);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Add files to form data state
  const [formData, setFormData] = useState<{title: string, description: string, audioFile: File | null, documentFile: File | null}>({ 
    title: '', description: '', audioFile: null, documentFile: null 
  });

  const fetchEnseignements = () => {
    if (!themeId) return;
    setLoading(true);
    api.getEnseignementsByTheme(themeId).then(data => {
      setEnseignements(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    // Get theme details from all themes
    api.getThemes().then(themes => {
      const currentTheme = themes.find((t: any) => t.id === themeId);
      if (currentTheme) setTheme(currentTheme);
    }).catch(err => toast.error("Erreur thèmes: " + err.message));
    
    fetchEnseignements();
  }, [themeId]);

  const uploadFileToDriveDirect = async (file: File, token: string, folderId: string) => {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.id;
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!themeId) return;

    try {
      setIsUploading(true);

      let token = '';
      let folderId = '';
      if (formData.audioFile || formData.documentFile) {
        token = await api.getAccessToken();
        folderId = await api.getDriveFolderId("Enseignements_Uploads");
      }

      let audioDriveId = '';
      if (formData.audioFile) {
        if (token.startsWith("mock-token")) {
          audioDriveId = "mock-audio-id-" + Date.now();
        } else {
          audioDriveId = await uploadFileToDriveDirect(formData.audioFile, token, folderId);
        }
      }

      let docDriveId = '';
      if (formData.documentFile) {
        if (token.startsWith("mock-token")) {
          docDriveId = "mock-doc-id-" + Date.now();
        } else {
          docDriveId = await uploadFileToDriveDirect(formData.documentFile, token, folderId);
        }
      }

      const audios = audioDriveId ? [{ id: Date.now().toString(), name: formData.audioFile!.name, url: audioDriveId }] : [];
      const documents = docDriveId ? [{ id: (Date.now() + 1).toString(), name: formData.documentFile!.name, size: 'Lien Drive', url: docDriveId }] : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        themeId,
        audios,
        documents
      };

      await api.createEnseignement(payload);
      toast.success("Enseignement ajouté et fichiers uploadés sur Google Drive");
      setIsModalOpen(false);
      setFormData({ title: '', description: '', audioFile: null, documentFile: null });
      fetchEnseignements();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout ou de l'upload vers Drive");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: any, id: string) => {
    e.preventDefault();
    if (!window.confirm("Supprimer cet enseignement ?")) return;
    try {
      await api.deleteEnseignement(id);
      toast.success("Enseignement supprimé");
      fetchEnseignements();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading && enseignements.length === 0) {
    return <div className="view-container animate-pulse-soft text-gray-500 font-medium">Chargement des enseignements...</div>;
  }

  return (
    <div className="view-container max-w-6xl mx-auto flex flex-col gap-8 pb-32">
      <div className="flex justify-between items-center">
        <Link to="/themes" className="inline-flex items-center text-[13px] font-semibold text-gray-500 hover:text-[#E63946] transition-colors w-fit">
          <ChevronLeft size={16} className="mr-1" />
          Retour aux thèmes
        </Link>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary animate-fade-in flex items-center gap-2">
            <Plus size={16} /> Ajouter
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
         <div className="flex items-center gap-4">
           <div 
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: theme?.color || '#000' }}
            ></div>
            <h1 className="view-title animate-fade-in">
              {theme?.name}
            </h1>
         </div>
         <p className="view-subtitle ml-8 animate-fade-in opacity-80" style={{ animationDelay: '0.1s' }}>{theme?.description}</p>
      </div>

      <div className="flex flex-col gap-3">
        {enseignements.length === 0 ? (
          <div className="p-10 border border-gray-100 rounded-[20px] bg-white text-center text-gray-500 text-[13px] font-medium shadow-sm">
            Aucun enseignement dans ce thème pour le moment.
          </div>
        ) : (
          <AnimatePresence>
            {enseignements.map((ens, idx) => (
              <motion.div 
                layout
                key={ens.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white p-4 px-5 rounded-[20px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-card hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: theme?.color || '#000' }}
                  ></div>
                  <div>
                    <Link to={`/enseignements/${ens.id}`} className="font-bold text-gray-800 hover:text-[#E63946] transition-colors text-[15px]">
                      {ens.title}
                    </Link>
                    <div className="text-[12px] text-gray-500 mt-1 font-medium">
                      Date : {formatDate(ens.date)} • {ens.listenCount} écoutes • {ens.documents?.length ? 'Audio + Doc' : (ens.audios?.length ? 'Audio' : 'Vide')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDelete(e, ens.id)}
                      className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-100 hover:border-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <Link to={`/enseignements/${ens.id}`} className="btn-secondary whitespace-nowrap text-xs py-2 px-4">
                    Ouvrir
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-2xl animate-scale-in">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h2 className="text-[1.25rem] font-bold text-gray-900 tracking-tight">Nouvel enseignement</h2>
                <p className="text-[13px] text-gray-500 mt-1">Ajoutez un nouvel enregistrement pour ce thème.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 flex flex-col gap-8">
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Informations principales */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-[11px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1 flex items-center gap-2">
                    <AlignLeft size={14} /> Informations
                  </h3>
                  <div>
                    <label className="form-label flex items-center gap-2">
                      Titre de l'enseignement <span className="text-[#E63946]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Type size={16} />
                      </div>
                      <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input pl-10" placeholder="Ex: La grâce (Partie 1)" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Description <span className="text-[#E63946]">*</span></label>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#E63946] focus-within:ring-2 focus-within:ring-[#e6394620] transition-all">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.description} 
                        onChange={val => setFormData({...formData, description: val})} 
                        placeholder="Résumé des points abordés..."
                        className="h-[140px] pb-[42px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Médias */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-[11px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1 flex items-center gap-2">
                    <UploadCloud size={14} /> Fichiers à uploader
                  </h3>
                  <div>
                    <label className="form-label flex items-center gap-2">Fichier Audio</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Headphones size={16} />
                      </div>
                      <input 
                        type="file" 
                        accept="audio/*"
                        onChange={e => setFormData({...formData, audioFile: e.target.files ? e.target.files[0] : null})} 
                        className="form-input pl-10 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">Format MP3 ou M4A conseillé. Pas de limite de taille stricte grâce à l'upload fractionné vers Drive.</p>
                  </div>
                  <div className="mt-2 text-left">
                    <label className="form-label flex items-center gap-2">Document PDF (Optionnel)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FileText size={16} />
                      </div>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={e => setFormData({...formData, documentFile: e.target.files ? e.target.files[0] : null})} 
                        className="form-input pl-10 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 items-center">
                {isUploading && <span className="text-[13px] text-gray-500 font-medium mr-auto animate-pulse flex items-center gap-2"><UploadCloud size={14} /> Téléchargement vers Drive en cours...</span>}
                <button type="button" disabled={isUploading} onClick={() => setIsModalOpen(false)} className="btn-secondary px-6 w-full sm:w-auto">Annuler</button>
                <button type="submit" disabled={isUploading} className="btn-primary px-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploading ? 'Enregistrement...' : 'Enregistrer l\'enseignement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import { ChevronLeft, Heart, FileText, Download, PlayCircle, Info, ExternalLink, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function EnseignementDetailView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [ens, setEns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavori, setIsFavori] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [enseignementData, favorisList] = await Promise.all([
          api.getEnseignement(id),
          user ? api.getFavoris(user.email) : Promise.resolve([])
        ]);

        setEns(enseignementData);
        setIsFavori(favorisList.some((f: any) => f.id === id));

        if (user) {
          const remoteNotes = await api.getNotes(user.email, id);
          setNotes(remoteNotes || '');
        }

        // Increment listen count automatically on load
        api.incrementListen(id);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        toast.error("Impossible de charger les données complètes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.email]);

  const [hasIncremented, setHasIncremented] = useState(false);

  const getDriveId = (input: string) => {
    if (!input) return '';
    // Regex simple pour extraire l'ID d'une URL drive si l'utilisateur a mis l'URL entière
    const match = input.match(/[-\w]{25,}/);
    return match ? match[0] : input;
  };

  const handleToggleFavori = async () => {
    if (!user) return;
    try {
      await api.toggleFavori(user.email, id!);
      setIsFavori(!isFavori);
      toast.success(isFavori ? "Retiré des favoris" : "Ajouté aux favoris");
    } catch {
      toast.error("Erreur lors de la modification des favoris");
    }
  };

  const handleSaveNotes = async () => {
    if (!user || !id) return;
    try {
      setIsSavingNotes(true);
      await api.saveNotes(user.email, id, notes);
      toast.success("Notes enregistrées sur le serveur");
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement des notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (loading) return <div className="view-container animate-pulse-soft font-medium text-gray-500">Chargement...</div>;
  if (!ens) return <div className="view-container text-gray-500">Enseignement introuvable.</div>;

  return (
    <div className="view-container max-w-4xl mx-auto flex flex-col gap-8 pb-32">
      <Link to={`/themes/${ens.themeId}`} className="inline-flex items-center text-[13px] font-semibold text-gray-500 hover:text-[#E63946] transition-colors w-fit">
        <ChevronLeft size={16} className="mr-1" />
        Retour à la liste
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
           <motion.h1 
             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
             className="text-2xl lg:text-[2rem] font-bold tracking-tight text-gray-900 leading-tight"
           >
             {ens.title}
           </motion.h1>
           <div className="flex items-center gap-2 mt-2 text-[13px] font-semibold text-gray-500 tracking-[0.01em]">
             <span>{formatDate(ens.date)}</span>
             <span className="opacity-50">•</span>
             <span>{ens.listenCount + 1} écoutes</span>
           </div>
        </div>
        
        <button 
          onClick={handleToggleFavori}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border transition-all text-sm ${isFavori ? 'border-red-200 bg-red-50 text-[#E63946]' : 'btn-secondary shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}
        >
          <Heart size={16} className={isFavori ? 'fill-[#E63946]' : ''} />
          {isFavori ? 'En favoris' : 'Favoris'}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }} 
        className="text-[15px] text-gray-600 leading-relaxed max-w-3xl prose prose-sm prose-red"
        dangerouslySetInnerHTML={{ __html: ens.description || '' }}
      />

      {/* AUDIO PLAYER ZONE */}
      <div className="flex flex-col gap-6 mt-6">
        <h2 className="text-[1.1rem] font-bold text-gray-900 flex items-center gap-2">
          <PlayCircle size={20} className="text-[#E63946]" />
          Écoute Enseignement
        </h2>
        
        {ens.audios && ens.audios.map((audio: any) => (
          <div key={audio.id} className="relative bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col group transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            {/* Player Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-50 text-[#E63946] rounded-xl flex items-center justify-center shadow-inner">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 line-clamp-1">{audio.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] bg-[#E63946] text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">DRIVE HD</span>
                    <span className="text-[10px] text-gray-400 font-semibold italic">Lecture sécurisée</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video/Audio Iframe */}
            <div className="relative aspect-video sm:aspect-auto sm:h-[220px] bg-black/5 flex items-center justify-center overflow-hidden">
              <iframe 
                src={`https://drive.google.com/file/d/${getDriveId(audio.url)}/preview`} 
                width="100%" 
                height="100%" 
                allow="autoplay"
                className="w-full h-full"
                title={audio.name}
              ></iframe>
            </div>

            {/* Player Footer / Actions */}
            <div className="flex items-center justify-between p-4 bg-white">
              <div className="flex items-center gap-4">
                <a 
                  href={`https://drive.google.com/file/d/${getDriveId(audio.url)}/view`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-[#E63946] transition-colors"
                >
                  <Maximize2 size={14} /> Mode Cinéma
                </a>
                <a 
                  href={`https://docs.google.com/uc?export=download&id=${getDriveId(audio.url)}`} 
                  className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-[#E63946] transition-colors"
                >
                  <Download size={14} /> Télécharger MP3
                </a>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Cloud
              </div>
            </div>
          </div>
        ))}
        {(!ens.audios || ens.audios.length === 0) && (
           <div className="bg-gray-50 border border-gray-100 p-5 rounded-[20px] flex items-center gap-3 text-gray-500 text-[13px] font-medium">
             <Info size={18} /> Aucun fichier audio disponible.
           </div>
        )}
      </div>

      {/* DOCUMENTS ZONE */}
      {ens.documents && ens.documents.length > 0 && (
        <div className="flex flex-col gap-4 pt-8 border-t border-gray-100">
          <h2 className="text-[1.1rem] font-bold text-gray-900">Documents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ens.documents.map((doc: any) => (
              <a href={doc.url?.startsWith('http') ? doc.url : (doc.url ? `https://drive.google.com/file/d/${doc.url}/view` : '#')} target="_blank" rel="noopener noreferrer" key={doc.id} className="flex items-center p-4 bg-white border border-gray-100 rounded-[20px] hover:border-gray-200 hover:shadow-card transition-all duration-200 group">
                <div className="h-10 w-10 bg-gray-50 text-[#E63946] border border-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-red-50 transition-colors">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 className="text-[13px] font-bold text-gray-800 truncate">{doc.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{doc.size}</p>
                </div>
                <Download size={18} className="text-gray-300 group-hover:text-[#E63946] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* NOTES PERSONNELLES (MOCK) */}
      <div className="flex flex-col gap-4 pt-8 border-t border-gray-100">
        <h2 className="text-[1.1rem] font-bold text-gray-900">Notes personnelles</h2>
        <div className="bg-white rounded-[20px] overflow-hidden border border-gray-200 focus-within:border-[#E63946] focus-within:ring-2 focus-within:ring-[#e6394620] shadow-sm transition-all">
          <ReactQuill 
            theme="snow" 
            value={notes} 
            onChange={setNotes} 
            placeholder="Prenez vos notes ici pendant l'écoute..."
            className="h-[200px] border-none pb-[42px]"
          />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="btn-primary px-6 py-2.5 disabled:opacity-50"
          >
            {isSavingNotes ? 'Enregistrement...' : 'Enregistrer les notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Link2, Download, Copy, Play } from 'lucide-react';
import { useAuthStore } from '../store';
import { toast } from 'sonner';

export function SettingsView() {
  const { apiUrl, setApiUrl } = useAuthStore();
  const [urlInput, setUrlInput] = useState(apiUrl);

  const handleSave = () => {
    setApiUrl(urlInput.trim());
    toast.success('URL sauvegardée avec succès');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SCRIPT_CODE);
    toast.success('Code copié dans le presse-papier');
  };

  return (
    <div className="view-container max-w-5xl mx-auto flex flex-col gap-8 pb-32">
      {!apiUrl && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm"
        >
          <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-amber-800 font-bold text-[14px]">Configuration requise</h3>
            <p className="text-amber-700 text-[13px] mt-1 leading-relaxed">
              L'URL de votre API n'est pas configurée. Veuillez suivre le guide ci-dessous pour déployer votre script Google et coller son URL.
            </p>
          </div>
        </motion.div>
      )}

      <header className="view-header flex flex-col gap-2 border-b border-gray-100 pb-6">
        <h1 className="view-title animate-fade-in">
          Configuration Google Sheets
        </h1>
        <p className="view-subtitle animate-fade-in max-w-2xl" style={{ animationDelay: '0.1s' }}>
          Connectez l'interface de l’application à votre base de données Google Sheets via Google Apps Script pour récupérer vos vrais Enseignements.
        </p>
      </header>

      {/* ETAPE 1: Configuration URL */}
      <section className="bg-white p-6 rounded-[26px] border border-gray-100 shadow-card flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-red-50 text-[#E63946] border border-[#E63946]/10 rounded-2xl flex items-center justify-center shrink-0">
             <Link2 size={24} />
          </div>
          <div>
            <h2 className="text-[1.1rem] font-bold text-gray-900">URL du Google Apps Script déployé</h2>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">Collez l'URL de votre Web App générée par Google Apps Script ici.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfy.../exec"
            className="form-input flex-1 focus:ring-[#E63946] focus:border-[#E63946]"
          />
          <button 
            onClick={handleSave}
            className="btn-primary whitespace-nowrap px-8"
          >
            Sauvegarder l'URL
          </button>
        </div>
      </section>

      {/* ETAPE 2: Guide */}
      <section className="flex flex-col gap-5 animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-[1.15rem] font-bold text-gray-900 ml-2">Comment déployer votre base de données ?</h2>
        
        <div className="grid gap-4">
          {[
            { step: 1, title: 'Créer le fichier', desc: 'Créez un nouveau fichier sur Google Sheets contenant les onglets (Themes, Enseignements, Utilisateurs, Favoris).' },
            { step: 2, title: 'Ouvrir Apps Script', desc: 'Dans Google Sheets, cliquez sur "Extensions" > "Apps Script".' },
            { step: 3, title: 'Coller le code', desc: 'Effacez le code existant, copiez le code fourni ci-dessous, et collez-le dans l\'éditeur. Modifiez SPREADSHEET_ID avec l\'ID réel de votre Sheet.' },
            { step: 4, title: 'Déployer', desc: 'Cliquez sur le bouton "Déployer" > "Nouvelle version". Choisissez "Application Web" (Web App).' },
            { step: 5, title: 'Permissions', desc: 'Réglez "Exécuter en tant que : Vous" et "Qui a accès : Tout le monde" (Anyone). Approuvez les permissions d\'accès à Drive/Sheets.' },
            { step: 6, title: 'Upload Direct', desc: 'Pour les très gros fichiers, l\'interface enverra directement le fichier à Drive (sans passer par Apps Script) en utilisant un token OAuth sécurisé. Pensez à relancer et réautoriser le script a chaque changement.' },
            { step: 7, title: 'Connecter', desc: 'Une fois déployé, copiez l\'URL de la Web App et collez-la dans le champ "URL" en haut de cette page.' },
          ].map((item) => (
             <div key={item.step} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-[20px] relative hover:border-gray-200 transition-colors shadow-sm">
                <div className="shrink-0 h-10 w-10 bg-gray-50 text-gray-400 font-bold text-sm flex items-center justify-center rounded-xl border border-gray-100">
                  {item.step}
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* ETAPE 3: Script */}
      <section className="flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-2">
           <div>
             <h2 className="text-[1.15rem] font-bold text-gray-900">Script `Code.gs`</h2>
             <p className="text-[13px] text-gray-500 mt-1">Le code maître à coller dans votre environnement Google Apps Script.</p>
           </div>
           <button 
             onClick={handleCopyCode}
             className="btn-secondary flex items-center gap-2"
           >
             <Copy size={16} /> Copier le code
           </button>
         </div>
         
         <div className="bg-[#111827] rounded-[24px] overflow-hidden shadow-xl border border-gray-800">
           <div className="flex items-center gap-2 px-6 py-4 bg-[#1F2937] border-b border-gray-800">
             <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
             <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
             <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
             <span className="ml-3 text-xs font-mono text-gray-400 font-medium">Code.gs</span>
           </div>
           <div className="p-6 overflow-x-auto">
             <pre className="text-[13px] leading-relaxed text-gray-300 font-mono">
               <code>{SCRIPT_CODE}</code>
             </pre>
           </div>
         </div>
      </section>
    </div>
  );
}

const SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT BACKEND (API)
 * IMPORTANT : 
 * Ce script DOIT ÊTRE LIÉ à votre fichier Google Sheets.
 * Pour le créer, ouvrez votre Google Sheets > Extensions > Apps Script.
 * Ensuite, copiez-collez tout ce code.
 * 
 * Déployer en tant qu'application Web (accessible à tous / exécutée en tant que vous).
 */

function doGet(e) {
  return ContentService.createTextOutput("API Enseignements est en ligne.").setMimeType(ContentService.MimeType.TEXT);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result = {};

    switch(action) {
      case 'getAccessToken': result = ScriptApp.getOAuthToken(); break;
      case 'getDriveFolderId': result = getOrCreateDriveFolder(data.payload?.folderName); break;
      case 'authenticateAndGetDashboard': result = authenticateAndGetDashboard(data.email); break;
      case 'getThemes': result = getThemes(); break;
      case 'createTheme': result = createTheme(data.payload); break;
      case 'updateTheme': result = updateTheme(data.id, data.payload); break;
      case 'deleteTheme': result = deleteTheme(data.id); break;
      case 'getEnseignements': result = getEnseignements(data.themeId); break;
      case 'getEnseignement': result = getEnseignement(data.id); break;
      case 'createEnseignement': result = createEnseignement(data.payload); break;
      case 'deleteEnseignement': result = deleteEnseignement(data.id); break;
      case 'getFavoris': result = getFavoris(data.email); break;
      case 'toggleFavori': result = toggleFavori(data.email, data.enseignementId); break;
      case 'getNotes': result = getNotes(data.email, data.enseignementId); break;
      case 'saveNotes': result = saveNotes(data.email, data.enseignementId, data.content); break;
      case 'incrementListenCount': result = incrementListenCount(data.enseignementId); break;
      default:
        // Action inconnue
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: action + " not implemented" }))
          .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * À EXÉCUTER MANUELLEMENT UNE FOIS
 * Initialise le fichier Google Sheets avec tous les onglets vitaux
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tables = {
    'Themes': ['id', 'name', 'description', 'color', 'createdAt'],
    'Enseignements': ['id', 'title', 'description', 'themeId', 'date', 'audios', 'documents', 'listenCount', 'createdAt'],
    'Favoris': ['email', 'enseignementId', 'createdAt'],
    'Notes': ['email', 'enseignementId', 'content', 'updatedAt'],
    'Users': ['email', 'role', 'createdAt']
  };

  for (const sheetName in tables) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(tables[sheetName]);
      sheet.getRange(1, 1, 1, tables[sheetName].length).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
  }
  
  const defaultSheet = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
  return "Base de données initialisée !";
}

// --- GESTION DES FICHIERS DRIVE ---
function getOrCreateDriveFolder(folderName) {
  if (!folderName) folderName = "Enseignements_Fichiers";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder.getId();
}

// --- UTILS DATABASE ---
function getSheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
    
function sheetToArray(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function parseEnseignement(row) {
  try { row.audios = JSON.parse(row.audios || '[]'); } catch(e) { row.audios = []; }
  try { row.documents = JSON.parse(row.documents || '[]'); } catch(e) { row.documents = []; }
  row.listenCount = Number(row.listenCount) || 0;
  return row;
}

// --- LOGIQUE MÉTIER ---
function authenticateAndGetDashboard(email) {
  const usersSheet = getSheet('Users');
  let users = sheetToArray(usersSheet);
  
  // Cherche l'utilisateur
  let currentUser = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
  let role = 'user';
  
  if (!currentUser) {
    // Si la liste est vide, le tout premier devient admin d'office
    role = users.length === 0 ? 'admin' : 'user';
    usersSheet.appendRow([email, role, new Date().toISOString()]);
  } else {
    role = currentUser.role;
  }

  const themes = sheetToArray(getSheet('Themes'));
  const enseignements = sheetToArray(getSheet('Enseignements'));
  const favoris = sheetToArray(getSheet('Favoris')).filter(f => f.email === email);
  
  return {
    user: { email, role: role },
    stats: {
      totalEnseignements: enseignements.length,
      totalThemes: themes.length,
      totalAudios: enseignements.reduce((acc, curr) => {
         let count = 0;
         try { count = JSON.parse(curr.audios || '[]').length; } catch(e){}
         return acc + count;
      }, 0),
      totalDocuments: enseignements.reduce((acc, curr) => {
         let count = 0;
         try { count = JSON.parse(curr.documents || '[]').length; } catch(e){}
         return acc + count;
      }, 0),
      totalEcoutes: enseignements.reduce((acc, curr) => acc + (Number(curr.listenCount) || 0), 0),
      favorisCount: favoris.length
    },
    recentEnseignements: enseignements.slice(-5).reverse().map(parseEnseignement),
    themeDistribution: themes.map(t => {
       return { name: t.name, count: enseignements.filter(e => e.themeId === t.id).length };
    })
  };
}

function getThemes() {
  const themes = sheetToArray(getSheet('Themes'));
  const enseignements = sheetToArray(getSheet('Enseignements'));
  return themes.map(t => {
    t.count = enseignements.filter(e => e.themeId === t.id).length;
    return t;
  });
}

function createTheme(payload) {
  const sheet = getSheet('Themes');
  const id = Utilities.getUuid();
  sheet.appendRow([id, payload.name, payload.description, payload.color, new Date().toISOString()]);
  return { id, ...payload, count: 0 };
}

function updateTheme(id, payload) {
  const sheet = getSheet('Themes');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      if (payload.name) sheet.getRange(i+1, 2).setValue(payload.name);
      if (payload.description) sheet.getRange(i+1, 3).setValue(payload.description);
      if (payload.color) sheet.getRange(i+1, 4).setValue(payload.color);
      break;
    }
  }
  return { id, ...payload };
}

function deleteTheme(id) {
  const sheet = getSheet('Themes');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i+1);
      break;
    }
  }
  return { success: true };
}

function getEnseignements(themeId) {
  const rows = sheetToArray(getSheet('Enseignements'));
  return rows.filter(r => r.themeId === themeId).map(parseEnseignement);
}

function getEnseignement(id) {
  const rows = sheetToArray(getSheet('Enseignements'));
  const ens = rows.find(r => r.id === id);
  return ens ? parseEnseignement(ens) : null;
}

function createEnseignement(payload) {
  const sheet = getSheet('Enseignements');
  const id = Utilities.getUuid();
  
  const newEns = {
    id: id,
    title: payload.title,
    description: payload.description,
    themeId: payload.themeId,
    date: new Date().toISOString().split('T')[0],
    audios: JSON.stringify(payload.audios || []),
    documents: JSON.stringify(payload.documents || []),
    listenCount: 0,
    createdAt: new Date().toISOString()
  };
  
  // Rend les fichiers accessibles (fallback)
  (payload.audios || []).forEach(f => {
     try { DriveApp.getFileById(f.url).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e){}
  });
  (payload.documents || []).forEach(f => {
     try { DriveApp.getFileById(f.url).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e){}
  });

  sheet.appendRow([newEns.id, newEns.title, newEns.description, newEns.themeId, newEns.date, newEns.audios, newEns.documents, newEns.listenCount, newEns.createdAt]);
  return parseEnseignement(newEns);
}

function deleteEnseignement(id) {
  const sheet = getSheet('Enseignements');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i+1);
      break;
    }
  }
  return { success: true };
}

function toggleFavori(email, enseignementId) {
  const sheet = getSheet('Favoris');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][1] === enseignementId) {
      sheet.deleteRow(i+1);
      return { status: 'removed' };
    }
  }
  sheet.appendRow([email, enseignementId, new Date().toISOString()]);
  return { status: 'added' };
}

function getFavoris(email) {
  const favs = sheetToArray(getSheet('Favoris')).filter(f => f.email === email).map(f => f.enseignementId);
  const allEns = sheetToArray(getSheet('Enseignements')).map(parseEnseignement);
  return allEns.filter(e => favs.includes(e.id));
}

function incrementListenCount(enseignementId) {
  const sheet = getSheet('Enseignements');
  const data = sheet.getDataRange().getValues();
  if(data.length <= 1) return {success: false};
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const listenIdx = headers.indexOf('listenCount');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === enseignementId) {
       let count = Number(data[i][listenIdx]) || 0;
       sheet.getRange(i+1, listenIdx + 1).setValue(count + 1);
       return { success: true, count: count + 1 };
    }
  }
  return { success: false };
}

function getNotes(email, enseignementId) {
  const notes = sheetToArray(getSheet('Notes'));
  const note = notes.find(n => n.email === email && n.enseignementId === enseignementId);
  return note ? note.content : '';
}

function saveNotes(email, enseignementId, content) {
  const sheet = getSheet('Notes');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][1] === enseignementId) {
      sheet.getRange(i+1, 3).setValue(content);
      sheet.getRange(i+1, 4).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  sheet.appendRow([email, enseignementId, content, new Date().toISOString()]);
  return { success: true };
}
`;

/**
 * GOOGLE APPS SCRIPT BACKEND (API)
 * IMPORTANT : 
 * Ce script DOIT ÊTRE LIÉ à votre fichier Google Sheets.
 * Pour le créer, ouvrez votre Google Sheets > Extensions > Apps Script.
 * Ensuite, copiez-collez tout ce code.
 * 
 * Déployer en tant qu'application Web (accessible à tous / exécutée en tant que vous).
 */

function doGet(e) {
  // Point d'entrée pour la Web App (Optionnel si tout passe par POST)
  return ContentService.createTextOutput("API Enseignements est en ligne.")
        .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result = {};

    switch(action) {
      case 'authenticateAndGetDashboard':
        result = authenticateAndGetDashboard(data.email);
        break;
      case 'getThemes':
        result = getThemes();
        break;
      case 'createTheme':
        result = createTheme(data.payload);
        break;
      case 'updateTheme':
        result = updateTheme(data.payload);
        break;
      case 'deleteTheme':
        result = deleteTheme(data.id);
        break;
      case 'getEnseignements':
        result = getEnseignements(data.themeId);
        break;
      case 'createEnseignement':
        result = createEnseignement(data.payload);
        break;
      case 'toggleFavori':
        result = toggleFavori(data.email, data.enseignementId);
        break;
      case 'getFavoris':
        result = getFavoris(data.email);
        break;
      case 'incrementListenCount':
        result = incrementListenCount(data.enseignementId);
        break;
      default:
        throw new Error("Action inconnue");
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Fonction utilitaire pour simuler l'accès à la feuille
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

/**
 * Fonction d'initialisation de la base de données.
 * À exécuter manuellement UNE FOIS depuis l'éditeur Apps Script
 * pour créer les onglets et les colonnes nécessaires dans le Google Sheet.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const tables = {
    'Themes': ['id', 'name', 'description', 'color', 'createdAt'],
    'Enseignements': ['id', 'title', 'description', 'themeId', 'date', 'audioUrl', 'documentUrl', 'listenCount', 'createdAt'],
    'Favoris': ['email', 'enseignementId', 'createdAt'],
    'Users': ['email', 'role', 'createdAt']
  };

  for (const sheetName in tables) {
    const headers = tables[sheetName];
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      
      // Mise en forme de la ligne d'en-tête
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
  }
  
  // Suppression de la feuille par défaut si existante
  const defaultSheet = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
  
  Logger.log("Base de données initialisée avec succès !");
  return "Succès";
}

// --- LOGIQUE MÉTIER ---

// Helper fonction manquante localement mais présente on SettingsView
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
  
  // Simulation de la récupération de la reste des infos (ou reliez avec vraie logique)
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
  // LECTURE BDD
  return [
    { id: '1', name: 'Fondamentaux', description: 'Les bases de... ', color: '#3b82f6', count: 12 },
    { id: '2', name: 'Avancé', description: 'Pour aller plus loin', color: '#8b5cf6', count: 5 }
  ];
}

function createTheme(payload) { return { id: new Date().getTime().toString(), ...payload }; }
function updateTheme(payload) { return payload; }
function deleteTheme(id) { return { deletedId: id }; }

function getEnseignements(themeId) { return []; }
function createEnseignement(payload) { return []; }

function toggleFavori(email, enseignementId) { return { status: 'added' }; }
function getFavoris(email) { return []; }
function incrementListenCount(enseignementId) { return { newCount: 15 }; }

// --- FICHIERS ---
function getAccessToken() {
  return ScriptApp.getOAuthToken();
}

function getDriveFolderId() {
  return "ID_DU_DOSSIER_AUDIO";
}

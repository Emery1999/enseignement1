import { useAuthStore } from '../store';

/**
 * Service API pour Google Apps Script.
 * Toutes les données sont persistées sur le serveur (Google Drive/Sheets).
 * Aucune donnée n'est stockée dans le localStorage.
 */

async function callAppsScript(action: string, data: any = {}) {
  const apiUrl = useAuthStore.getState().apiUrl;
  
  if (!apiUrl) {
    throw new Error("L'URL de l'API n'est pas configurée. Veuillez la définir dans les paramètres ou via VITE_API_URL.");
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("Erreur de parsing de la réponse serveur:", text);
      throw new Error("La réponse du serveur n'est pas un JSON valide.");
    }

    if (json.success && json.data !== undefined) {
      return json.data;
    }

    throw new Error(json.error || "Une erreur inconnue est survenue sur le serveur.");
  } catch (error) {
    console.error(`[API Error] ${action}:`, error);
    throw error;
  }
}

export const api = {
  getDashboardStats: async () => {
    const email = useAuthStore.getState().user?.email;
    return callAppsScript('authenticateAndGetDashboard', { email });
  },

  getThemes: async () => {
    return callAppsScript('getThemes');
  },

  getAccessToken: async (): Promise<string> => {
    return callAppsScript('getAccessToken');
  },

  getDriveFolderId: async (folderName: string): Promise<string> => {
    return callAppsScript('getDriveFolderId', { payload: { folderName } });
  },

  createTheme: async (payload: any) => {
    return callAppsScript('createTheme', { payload });
  },

  updateTheme: async (id: string, payload: any) => {
    return callAppsScript('updateTheme', { id, payload });
  },

  deleteTheme: async (id: string) => {
    return callAppsScript('deleteTheme', { id });
  },

  getEnseignementsByTheme: async (themeId: string) => {
    return callAppsScript('getEnseignements', { themeId });
  },

  getEnseignement: async (id: string) => {
    return callAppsScript('getEnseignement', { id });
  },

  createEnseignement: async (payload: any) => {
    return callAppsScript('createEnseignement', { payload });
  },

  deleteEnseignement: async (id: string) => {
    return callAppsScript('deleteEnseignement', { id });
  },

  getFavoris: async (email?: string) => {
    const userEmail = email || useAuthStore.getState().user?.email;
    return callAppsScript('getFavoris', { email: userEmail });
  },

  toggleFavori: async (email: string, enseignementId: string) => {
    return callAppsScript('toggleFavori', { email, enseignementId });
  },

  getNotes: async (email: string, enseignementId: string) => {
    return callAppsScript('getNotes', { email, enseignementId });
  },

  saveNotes: async (email: string, enseignementId: string, content: string) => {
    return callAppsScript('saveNotes', { email, enseignementId, content });
  },

  incrementListen: async (enseignementId: string) => {
    return callAppsScript('incrementListenCount', { enseignementId });
  }
};

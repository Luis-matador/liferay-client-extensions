// Servicio de autenticación Liferay

class LiferayAuthService {
  constructor() {
    this.currentUser = null;
    this.isLiferayContext = false;
    this.baseURL = '';
  }

  async initialize() {
    try {
      if (typeof Liferay !== 'undefined' && Liferay.ThemeDisplay) {
        this.isLiferayContext = true;
        this.baseURL = Liferay.ThemeDisplay.getPortalURL();
        
        const themeDisplay = Liferay.ThemeDisplay;
        
        if (themeDisplay.isSignedIn()) {
          this.currentUser = {
            userId: themeDisplay.getUserId(),
            userName: themeDisplay.getUserName(),
            emailAddress: themeDisplay.getUserEmailAddress(),
            companyId: themeDisplay.getCompanyId(),
            groupId: themeDisplay.getScopeGroupId(),
            languageId: themeDisplay.getLanguageId()
          };
          
          console.log('✅ Usuario autenticado en Liferay:', this.currentUser.userName);
          return this.currentUser;
        } else {
          console.warn('⚠️ Usuario no autenticado en Liferay Portal');
          return null;
        }
      } else {
        console.warn('⚠️ No se detectó contexto Liferay - Usando usuario mock');
        this.currentUser = {
          userId: '12345',
          userName: 'Usuario Demo',
          emailAddress: 'demo@liferay.com',
          companyId: '20097',
          groupId: '20119',
          languageId: 'es_ES'
        };
        return this.currentUser;
      }
    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      return null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUserId() {
    return this.currentUser?.userId || null;
  }

  getAuthHeaders() {
    if (!this.isLiferayContext) {
      return { 'Content-Type': 'application/json' };
    }

    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': Liferay.authToken || ''
    };
  }

  getBaseURL() {
    return this.isLiferayContext ? this.baseURL : 'http://localhost:8080';
  }

  isLiferay() {
    return this.isLiferayContext;
  }
}

// Exportar instancia singleton
export const liferayAuthService = new LiferayAuthService();

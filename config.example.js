/**
 * TOD - Configuration Example
 * 
 * Copiez ce fichier et renommez-le en config.js
 * Modifiez les valeurs selon votre environnement
 * 
 * Note: Pour une utilisation en production, vous pouvez intégrer ces valeurs
 * directement dans loader.js et error-page.js, ou utiliser des variables d'environnement
 * si vous utilisez un build process.
 */

const TOD_CONFIG = {
    // API Backend TOD
    api: {
        endpoint: 'https://api.tod.example.com/v1/activation/status',
        timeout: 30000 // 30 secondes
    },
    
    // URLs de redirection
    urls: {
        success: 'https://merchant.example.com/success',
        error: 'error.html',
        todLogin: 'https://tod.example.com/login'
    },
    
    // Délais
    delays: {
        pollingInterval: 2000, // 2 secondes entre chaque vérification
        redirectDelay: 5000 // 5 secondes avant redirection automatique
    }
};

// Pour utilisation dans les scripts
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = TOD_CONFIG;
// }



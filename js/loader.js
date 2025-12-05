/**
 * TOD - Loader Page Script
 * Gère l'affichage du loader et les appels API pour vérifier l'état de l'activation
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // URL de l'API backend TOD pour vérifier l'état
        // À configurer selon l'environnement
        apiEndpoint: 'https://api.tod.example.com/v1/activation/status',
        
        // URL de succès vers laquelle rediriger en cas de succès
        successUrl: 'https://merchant.example.com/success',
        
        // URL de base pour la page d'erreur
        errorPageUrl: 'error.html',
        
        // Intervalle de polling (en millisecondes)
        pollingInterval: 2000,
        
        // Timeout maximum (en millisecondes)
        maxTimeout: 30000
    };
    
    // Récupération des paramètres URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            lang: params.get('lang') || 'fr',
            transactionId: params.get('transactionId') || null,
            merchantId: params.get('merchantId') || null
        };
    }
    
    // Application de la langue et direction
    function applyLanguage(lang) {
        const html = document.documentElement;
        const body = document.body;
        
        if (lang === 'ar') {
            html.setAttribute('lang', 'ar');
            html.setAttribute('dir', 'rtl');
            body.setAttribute('dir', 'rtl');
        } else {
            html.setAttribute('lang', 'fr');
            html.setAttribute('dir', 'ltr');
            body.setAttribute('dir', 'ltr');
        }
    }
    
    // Textes bilingues
    const TEXTS = {
        fr: {
            title: 'Activation de votre compte TOD en cours…',
            subtitle: 'Ceci peut prendre quelques instants. Merci de ne pas fermer cette fenêtre.'
        },
        ar: {
            title: 'جاري تفعيل حسابك على TOD…',
            subtitle: 'قد تستغرق هذه العملية بضع لحظات. يُرجى عدم إغلاق هذه النافذة.'
        }
    };
    
    // Mise à jour des textes selon la langue
    function updateTexts(lang) {
        const texts = TEXTS[lang] || TEXTS.fr;
        const titleEl = document.getElementById('title');
        const subtitleEl = document.getElementById('subtitle');
        
        if (titleEl) titleEl.textContent = texts.title;
        if (subtitleEl) subtitleEl.textContent = texts.subtitle;
    }
    
    // Redirection vers la page d'erreur
    function redirectToError(errorCode, lang) {
        const errorUrl = `${CONFIG.errorPageUrl}?errorCode=${encodeURIComponent(errorCode)}&lang=${lang}`;
        window.location.href = errorUrl;
    }
    
    // Redirection vers la page de succès
    function redirectToSuccess() {
        window.location.href = CONFIG.successUrl;
    }
    
    // Appel API pour vérifier l'état de l'activation
    async function checkActivationStatus(transactionId, merchantId) {
        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transactionId: transactionId,
                    merchantId: merchantId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            throw error;
        }
    }
    
    // Polling pour vérifier l'état
    function startPolling(transactionId, merchantId, lang) {
        let attempts = 0;
        const maxAttempts = Math.floor(CONFIG.maxTimeout / CONFIG.pollingInterval);
        
        const poll = setInterval(async () => {
            attempts++;
            
            try {
                const result = await checkActivationStatus(transactionId, merchantId);
                
                if (result.status === 'success') {
                    clearInterval(poll);
                    redirectToSuccess();
                } else if (result.status === 'error') {
                    clearInterval(poll);
                    const errorCode = result.errorCode || 'TECHNICAL_ERROR';
                    redirectToError(errorCode, lang);
                }
                // Si status === 'pending', on continue le polling
                
            } catch (error) {
                // En cas d'erreur réseau ou autre, on continue à essayer
                // jusqu'à atteindre le timeout maximum
                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    redirectToError('TECHNICAL_ERROR', lang);
                }
            }
            
            // Timeout de sécurité
            if (attempts >= maxAttempts) {
                clearInterval(poll);
                redirectToError('TECHNICAL_ERROR', lang);
            }
        }, CONFIG.pollingInterval);
    }
    
    // Initialisation
    function init() {
        const params = getUrlParams();
        const lang = params.lang;
        
        // Application de la langue
        applyLanguage(lang);
        updateTexts(lang);
        
        // Démarrage du polling si on a les paramètres nécessaires
        if (params.transactionId && params.merchantId) {
            startPolling(params.transactionId, params.merchantId, lang);
        } else {
            // Si pas de paramètres, on redirige vers une erreur
            // (cas où la page est accédée directement sans paramètres)
            setTimeout(() => {
                redirectToError('TECHNICAL_ERROR', lang);
            }, 2000);
        }
    }
    
    // Lancement au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();



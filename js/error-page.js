/**
 * TOD - Error Page Script
 * Gère l'affichage des messages d'erreur selon le code d'erreur et la langue
 * Gère les redirections automatiques pour certains codes d'erreur
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // URL TOD vers laquelle rediriger pour les cas spécifiques
        todRedirectUrl: 'https://tod.example.com/login',
        
        // Délai avant redirection (en millisecondes)
        redirectDelay: 5000
    };
    
    /**
     * ============================================
     * MAPPING DES ERREURS
     * ============================================
     * 
     * Chaque erreur contient :
     * - messageFr : message en français
     * - messageAr : message en arabe
     * - shouldRedirect : true si redirection automatique nécessaire
     */
    const ERROR_MAPPING = {
        // [PAIEMENT]
        'PAYMENT_INSUFFICIENT_FUNDS': {
            messageFr: 'Votre solde est insuffisant. Merci de recharger votre compte puis de réessayer le paiement.',
            messageAr: 'رصيدك غير كافٍ. يُرجى تعبئة رصيدك ثم إعادة محاولة الدفع.',
            shouldRedirect: false
        },
        'PAYMENT_FAILED': {
            messageFr: 'Le paiement a échoué. Une erreur est survenue lors du traitement de votre transaction. Veuillez réessayer plus tard.',
            messageAr: 'فشل الدفع. حدث خطأ أثناء معالجة العملية. يُرجى المحاولة مرة أخرى لاحقًا.',
            shouldRedirect: false
        },
        'PAYMENT_INVALID_PIN': {
            messageFr: 'Le code PIN saisi est incorrect. Veuillez vérifier votre code PIN et réessayer.',
            messageAr: 'رمز الـ PIN الذي أدخلته غير صحيح. يُرجى التحقق من الرمز والمحاولة مرة أخرى.',
            shouldRedirect: false
        },
        
        // [AUTH TOD / JWT]
        'TOD_AUTH_INVALID_REQUEST': {
            messageFr: 'Une erreur technique est survenue. Veuillez réessayer plus tard.',
            messageAr: 'حدث خطأ تقني. يُرجى المحاولة مرة أخرى لاحقًا.',
            shouldRedirect: false
        },
        'TOD_AUTH_MISSING_PASSWORD': {
            messageFr: 'Une erreur technique est survenue. Veuillez réessayer plus tard.',
            messageAr: 'حدث خطأ تقني. يُرجى المحاولة مرة أخرى لاحقًا.',
            shouldRedirect: false
        },
        'TOD_AUTH_MISSING_USERNAME': {
            messageFr: 'Une erreur technique est survenue. Veuillez réessayer plus tard.',
            messageAr: 'حدث خطأ تقني. يُرجى المحاولة مرة أخرى لاحقًا.',
            shouldRedirect: false
        },
        
        // [ACCOUNT TOD]
        'TOD_ACCOUNT_PHONE_REQUIRED': {
            messageFr: 'Votre numéro de téléphone est manquant. Merci de recommencer la procédure d\'activation.',
            messageAr: 'رقم هاتفك غير متوفر. يُرجى إعادة بدء عملية التفعيل.',
            shouldRedirect: false
        },
        'TOD_ACCOUNT_PHONE_INVALID': {
            messageFr: 'Le numéro de téléphone saisi est invalide. Veuillez vérifier votre numéro et recommencer la procédure.',
            messageAr: 'رقم الهاتف الذي أدخلته غير صالح. يُرجى التحقق من الرقم وإعادة بدء العملية.',
            shouldRedirect: false
        },
        'TOD_ACCOUNT_USER_ALREADY_EXISTS': {
            messageFr: 'Un compte TOD existe déjà pour ce numéro. Vous allez être redirigé vers la page de connexion/activation TOD.',
            messageAr: 'يوجد حساب TOD بالفعل مرتبط بهذا الرقم. سيتم تحويلك إلى صفحة تسجيل الدخول / التفعيل الخاصة بـ TOD.',
            shouldRedirect: true
        },
        
        // [SUBSCRIPTION TOD]
        'TOD_SUB_OPTIONID_NOT_FOUND': {
            messageFr: 'L\'offre sélectionnée n\'est plus disponible. Veuillez revenir sur la page du marchand et sélectionner une autre offre.',
            messageAr: 'العرض الذي تم اختياره لم يعد متوفرًا. يُرجى العودة إلى صفحة التاجر واختيار عرض آخر.',
            shouldRedirect: false
        },
        'TOD_SUB_EXPIRATION_PAST': {
            messageFr: 'Une erreur s\'est produite lors de l\'activation de votre abonnement. Veuillez réessayer plus tard ou contacter le service client.',
            messageAr: 'حدث خطأ أثناء تفعيل اشتراكك. يُرجى المحاولة مرة أخرى لاحقًا أو الاتصال بخدمة الزبناء.',
            shouldRedirect: false
        },
        'TOD_SUB_ALREADY_EXISTS': {
            messageFr: 'Vous disposez déjà d\'un abonnement actif à ce service. Vous allez être redirigé vers la page TOD.',
            messageAr: 'لديك بالفعل اشتراك فعّال في هذه الخدمة. سيتم تحويلك إلى صفحة TOD.',
            shouldRedirect: true
        },
        
        // [GENÉRIQUE]
        'TECHNICAL_ERROR': {
            messageFr: 'Une erreur technique est survenue. Veuillez réessayer plus tard.',
            messageAr: 'حدث خطأ تقني. يُرجى المحاولة مرة أخرى لاحقًا.',
            shouldRedirect: false
        }
    };
    
    // Récupération des paramètres URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            errorCode: params.get('errorCode') || 'TECHNICAL_ERROR',
            lang: params.get('lang') || 'fr'
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
    
    // Récupération du message d'erreur selon le code et la langue
    function getErrorMessage(errorCode, lang) {
        const error = ERROR_MAPPING[errorCode] || ERROR_MAPPING['TECHNICAL_ERROR'];
        
        if (lang === 'ar') {
            return error.messageAr;
        } else {
            return error.messageFr;
        }
    }
    
    // Vérification si une redirection est nécessaire
    function shouldRedirect(errorCode) {
        const error = ERROR_MAPPING[errorCode] || ERROR_MAPPING['TECHNICAL_ERROR'];
        return error.shouldRedirect === true;
    }
    
    // Affichage du message d'erreur
    function displayError(message) {
        const errorMessageEl = document.getElementById('errorMessage');
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
    }
    
    // Gestion du compte à rebours pour redirection
    function startCountdown(lang, callback) {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        
        countdownEl.style.display = 'block';
        
        let remaining = Math.floor(CONFIG.redirectDelay / 1000);
        
        const countdownTexts = {
            fr: 'Redirection dans {seconds} seconde(s)...',
            ar: 'سيتم التوجيه خلال {seconds} ثانية...'
        };
        
        const updateCountdown = () => {
            const text = (countdownTexts[lang] || countdownTexts.fr).replace('{seconds}', remaining);
            countdownEl.textContent = text;
            
            if (remaining > 0) {
                remaining--;
                setTimeout(updateCountdown, 1000);
            } else {
                callback();
            }
        };
        
        updateCountdown();
    }
    
    // Redirection vers l'URL TOD
    function redirectToTod() {
        window.location.href = CONFIG.todRedirectUrl;
    }
    
    // Initialisation
    function init() {
        const params = getUrlParams();
        const errorCode = params.errorCode.toUpperCase();
        const lang = params.lang;
        
        // Application de la langue
        applyLanguage(lang);
        
        // Récupération et affichage du message d'erreur
        const errorMessage = getErrorMessage(errorCode, lang);
        displayError(errorMessage);
        
        // Gestion de la redirection automatique si nécessaire
        if (shouldRedirect(errorCode)) {
            startCountdown(lang, redirectToTod);
        }
    }
    
    // Lancement au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();



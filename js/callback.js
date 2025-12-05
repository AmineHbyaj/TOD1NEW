/**
 * TOD - Callback Page Script
 * Page unique qui gère :
 * - Affichage d'erreur directe si errorCode présent dans l'URL
 * - Appel API et gestion des états (pending, success, error)
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // URL de l'API backend TOD pour vérifier l'état
        apiEndpoint: 'https://api.tod.example.com/v1/activation/status',
        
        // URL de succès vers laquelle rediriger en cas de succès
        successUrl: 'https://merchant.example.com/success',
        
        // URL TOD vers laquelle rediriger pour les cas spécifiques
        todRedirectUrl: 'https://tod.example.com/login',
        
        // Intervalle de polling (en millisecondes)
        pollingInterval: 2000,
        
        // Timeout maximum (en millisecondes)
        maxTimeout: 60000,
        
        // Délai avant redirection après succès (en millisecondes)
        successRedirectDelay: 3000
    };
    
    /**
     * ============================================
     * MAPPING DES ERREURS
     * ============================================
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
    
    // Textes bilingues pour loader et succès
    const TEXTS = {
        fr: {
            loader: {
                title: 'Activation de votre compte TOD en cours…',
                subtitle: 'Ceci peut prendre quelques instants. Merci de ne pas fermer cette fenêtre.'
            },
            success: {
                title: 'Votre abonnement TOD a été activé avec succès !',
                subtitle: 'Vous allez être redirigé dans quelques instants...',
                countdown: 'Redirection dans {seconds} seconde(s)...'
            }
        },
        ar: {
            loader: {
                title: 'جاري تفعيل حسابك على TOD…',
                subtitle: 'قد تستغرق هذه العملية بضع لحظات. يُرجى عدم إغلاق هذه النافذة.'
            },
            success: {
                title: 'تم تفعيل اشتراكك في TOD بنجاح!',
                subtitle: 'سيتم تحويلك خلال لحظات...',
                countdown: 'سيتم التوجيه خلال {seconds} ثانية...'
            }
        }
    };
    
    // Récupération des paramètres URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            lang: params.get('lang') || 'fr',
            errorCode: params.get('errorCode') || null,
            status: params.get('status') || null, // 'success' si paiement réussi
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
    
    // Affichage d'un état (masque les autres)
    function showState(state) {
        document.getElementById('loaderState').style.display = state === 'loader' ? 'flex' : 'none';
        document.getElementById('successState').style.display = state === 'success' ? 'flex' : 'none';
        document.getElementById('errorState').style.display = state === 'error' ? 'flex' : 'none';
    }
    
    // Affichage de l'état LOADER
    function showLoader(lang) {
        showState('loader');
        const texts = TEXTS[lang] || TEXTS.fr;
        document.getElementById('loaderTitle').textContent = texts.loader.title;
        document.getElementById('loaderSubtitle').textContent = texts.loader.subtitle;
    }
    
    // Affichage de l'état SUCCÈS
    function showSuccess(lang) {
        showState('success');
        const texts = TEXTS[lang] || TEXTS.fr;
        document.getElementById('successTitle').textContent = texts.success.title;
        document.getElementById('successSubtitle').textContent = texts.success.subtitle;
        
        // Compte à rebours avant redirection
        startSuccessCountdown(lang);
    }
    
    // Affichage de l'état ERREUR
    function showError(errorCode, lang) {
        showState('error');
        const error = ERROR_MAPPING[errorCode] || ERROR_MAPPING['TECHNICAL_ERROR'];
        const message = lang === 'ar' ? error.messageAr : error.messageFr;
        
        document.getElementById('errorMessage').textContent = message;
        
        // Gestion de la redirection automatique si nécessaire
        if (error.shouldRedirect) {
            const countdownEl = document.getElementById('errorCountdown');
            countdownEl.style.display = 'block';
            startErrorCountdown(lang, () => {
                window.location.href = CONFIG.todRedirectUrl;
            });
        }
    }
    
    // Récupération du message d'erreur
    function getErrorMessage(errorCode, lang) {
        const error = ERROR_MAPPING[errorCode] || ERROR_MAPPING['TECHNICAL_ERROR'];
        return lang === 'ar' ? error.messageAr : error.messageFr;
    }
    
    // Compte à rebours pour succès
    function startSuccessCountdown(lang) {
        const countdownEl = document.getElementById('successCountdown');
        const texts = TEXTS[lang] || TEXTS.fr;
        let remaining = Math.floor(CONFIG.successRedirectDelay / 1000);
        
        const updateCountdown = () => {
            const text = texts.success.countdown.replace('{seconds}', remaining);
            countdownEl.textContent = text;
            
            if (remaining > 0) {
                remaining--;
                setTimeout(updateCountdown, 1000);
            } else {
                window.location.href = CONFIG.successUrl;
            }
        };
        
        updateCountdown();
    }
    
    // Compte à rebours pour erreur avec redirection
    function startErrorCountdown(lang, callback) {
        const countdownEl = document.getElementById('errorCountdown');
        const countdownTexts = {
            fr: 'Redirection dans {seconds} seconde(s)...',
            ar: 'سيتم التوجيه خلال {seconds} ثانية...'
        };
        
        let remaining = 5;
        
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
                    showSuccess(lang);
                } else if (result.status === 'error') {
                    clearInterval(poll);
                    const errorCode = result.errorCode || 'TECHNICAL_ERROR';
                    showError(errorCode, lang);
                }
                // Si status === 'pending', on continue le polling
                
            } catch (error) {
                // En cas d'erreur réseau, on continue à essayer
                // jusqu'à atteindre le timeout maximum
                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    showError('TECHNICAL_ERROR', lang);
                }
            }
            
            // Timeout de sécurité
            if (attempts >= maxAttempts) {
                clearInterval(poll);
                showError('TECHNICAL_ERROR', lang);
            }
        }, CONFIG.pollingInterval);
    }
    
    // Initialisation
    function init() {
        const params = getUrlParams();
        const lang = params.lang;
        
        // Application de la langue
        applyLanguage(lang);
        
        // CAS 1: Erreur directe dans l'URL (paiement échoué)
        if (params.errorCode) {
            const errorCode = params.errorCode.toUpperCase();
            showError(errorCode, lang);
            return;
        }
        
        // CAS 2: Paiement réussi, on appelle l'API
        if (params.status === 'success' || (!params.errorCode && params.transactionId && params.merchantId)) {
            showLoader(lang);
            
            if (params.transactionId && params.merchantId) {
                startPolling(params.transactionId, params.merchantId, lang);
            } else {
                // Paramètres manquants
                setTimeout(() => {
                    showError('TECHNICAL_ERROR', lang);
                }, 2000);
            }
            return;
        }
        
        // CAS 3: Paramètres invalides ou manquants
        showError('TECHNICAL_ERROR', lang);
    }
    
    // Lancement au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();



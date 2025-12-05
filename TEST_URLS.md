# URLs de Test - TOD Page Callback Unique

## 🌐 Serveur Local
Base URL: `http://localhost:8000`

---

## 📄 PAGE CALLBACK UNIQUE

La page `callback.html` gère **tous les cas** : erreur directe, succès avec loader, et affichage des résultats.

---

## ❌ CAS 1 : ERREUR DIRECTE (Paiement échoué)

Quand le paiement échoue, la page de paiement redirige avec `errorCode` dans l'URL.

### Erreurs de Paiement

#### PAYMENT_INSUFFICIENT_FUNDS (Solde insuffisant)
**FR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_INSUFFICIENT_FUNDS&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_INSUFFICIENT_FUNDS&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### PAYMENT_FAILED (Paiement échoué)
**FR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_FAILED&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_FAILED&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### PAYMENT_INVALID_PIN (Code PIN incorrect)
**FR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_INVALID_PIN&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=PAYMENT_INVALID_PIN&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

### Erreurs d'Authentification TOD

#### TOD_AUTH_INVALID_REQUEST
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_INVALID_REQUEST&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_INVALID_REQUEST&lang=ar
```
**Comportement:** Message d'erreur technique, pas de redirection

---

#### TOD_AUTH_MISSING_PASSWORD
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_MISSING_PASSWORD&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_MISSING_PASSWORD&lang=ar
```
**Comportement:** Message d'erreur technique, pas de redirection

---

#### TOD_AUTH_MISSING_USERNAME
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_MISSING_USERNAME&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_AUTH_MISSING_USERNAME&lang=ar
```
**Comportement:** Message d'erreur technique, pas de redirection

---

### Erreurs de Compte TOD

#### TOD_ACCOUNT_PHONE_REQUIRED (Numéro de téléphone manquant)
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_PHONE_REQUIRED&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_PHONE_REQUIRED&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### TOD_ACCOUNT_PHONE_INVALID (Numéro de téléphone invalide)
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_PHONE_INVALID&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_PHONE_INVALID&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### TOD_ACCOUNT_USER_ALREADY_EXISTS (Compte déjà existant) ⚠️ REDIRECTION AUTO
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_USER_ALREADY_EXISTS&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_ACCOUNT_USER_ALREADY_EXISTS&lang=ar
```
**Comportement:** Message + compte à rebours 5 secondes → Redirection automatique vers TOD

---

### Erreurs d'Abonnement TOD

#### TOD_SUB_OPTIONID_NOT_FOUND (Offre non disponible)
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_OPTIONID_NOT_FOUND&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_OPTIONID_NOT_FOUND&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### TOD_SUB_EXPIRATION_PAST (Erreur d'activation d'abonnement)
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_EXPIRATION_PAST&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_EXPIRATION_PAST&lang=ar
```
**Comportement:** Message d'erreur, pas de redirection

---

#### TOD_SUB_ALREADY_EXISTS (Abonnement déjà existant) ⚠️ REDIRECTION AUTO
**FR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_ALREADY_EXISTS&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TOD_SUB_ALREADY_EXISTS&lang=ar
```
**Comportement:** Message + compte à rebours 5 secondes → Redirection automatique vers TOD

---

### Erreur Générique

#### TECHNICAL_ERROR (Erreur technique - Fallback)
**FR:**
```
http://localhost:8000/callback.html?errorCode=TECHNICAL_ERROR&lang=fr
```
**AR:**
```
http://localhost:8000/callback.html?errorCode=TECHNICAL_ERROR&lang=ar
```
**Comportement:** Message d'erreur technique, pas de redirection

---

## ✅ CAS 2 : SUCCÈS (Paiement réussi - avec appel API)

Quand le paiement réussit, la page de paiement redirige avec `status=success` et les IDs.

### Français
```
http://localhost:8000/callback.html?status=success&transactionId=TEST123&merchantId=MERCHANT456&lang=fr
```

### Arabe
```
http://localhost:8000/callback.html?status=success&transactionId=TEST123&merchantId=MERCHANT456&lang=ar
```

**Comportement :**
1. Affiche le **loader** immédiatement
2. Appelle l'API backend (`/v1/activation/status`)
3. L'API peut répondre :
   - **`pending`** → Continue le polling (loader reste affiché)
   - **`success`** → Affiche message de succès puis redirige après 3 secondes
   - **`error`** → Affiche l'erreur avec le code d'erreur

**Note:** L'API doit être configurée dans `js/callback.js` pour fonctionner.

---

## 🧪 Tests de Cas Limites

### Code d'erreur inconnu (utilise TECHNICAL_ERROR comme fallback)
```
http://localhost:8000/callback.html?errorCode=UNKNOWN_ERROR&lang=fr
```

### Langue non spécifiée (défaut: français)
```
http://localhost:8000/callback.html?errorCode=PAYMENT_FAILED
```

### Paramètres manquants pour succès (affiche erreur technique)
```
http://localhost:8000/callback.html?status=success
```

### Sans paramètres (affiche erreur technique)
```
http://localhost:8000/callback.html
```

---

## 📋 Checklist de Test

### ✅ Erreurs directes (sans redirection)
- [ ] PAYMENT_INSUFFICIENT_FUNDS (FR/AR)
- [ ] PAYMENT_FAILED (FR/AR)
- [ ] PAYMENT_INVALID_PIN (FR/AR)
- [ ] TOD_AUTH_* (FR/AR)
- [ ] TOD_ACCOUNT_PHONE_REQUIRED (FR/AR)
- [ ] TOD_ACCOUNT_PHONE_INVALID (FR/AR)
- [ ] TOD_SUB_OPTIONID_NOT_FOUND (FR/AR)
- [ ] TOD_SUB_EXPIRATION_PAST (FR/AR)
- [ ] TECHNICAL_ERROR (FR/AR)

### ✅ Erreurs avec redirection automatique
- [ ] TOD_ACCOUNT_USER_ALREADY_EXISTS (FR/AR) - Vérifier compte à rebours
- [ ] TOD_SUB_ALREADY_EXISTS (FR/AR) - Vérifier compte à rebours

### ✅ Succès avec appel API
- [ ] Loader s'affiche immédiatement
- [ ] API répond "pending" → polling continue
- [ ] API répond "success" → message de succès + redirection après 3s
- [ ] API répond "error" → affiche l'erreur

### ✅ Responsive
- [ ] Mobile (< 480px)
- [ ] Tablette (< 768px)
- [ ] Desktop (> 768px)

### ✅ RTL/LTR
- [ ] Direction RTL pour l'arabe
- [ ] Direction LTR pour le français
- [ ] Alignement du texte correct

### ✅ UI/UX
- [ ] Logo TOD visible
- [ ] Aucun bouton visible sur page d'erreur
- [ ] Messages clairs et professionnels
- [ ] Design premium avec animations
- [ ] États visuels distincts (loader/succès/erreur)

---

## 🔌 Simulation API pour Tests

Pour tester le flow complet, vous pouvez utiliser un mock API ou modifier temporairement `js/callback.js` pour simuler les réponses :

```javascript
// Simulation dans checkActivationStatus
async function checkActivationStatus(transactionId, merchantId) {
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler différentes réponses
    return {
        status: 'success' // ou 'pending' ou 'error'
        // errorCode: 'TECHNICAL_ERROR' // si status === 'error'
    };
}
```

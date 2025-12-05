# Flow de la Page Callback TOD

## 📋 Vue d'ensemble

Une **seule page** (`callback.html`) gère tous les cas : succès, erreur et chargement.

## 🔄 Flow Complet

### 1. Après le paiement
Le client est redirigé vers `callback.html` avec des paramètres dans l'URL.

### 2. Cas d'erreur directe
Si le paiement a échoué, la page de paiement redirige avec `errorCode` :

```
callback.html?errorCode=PAYMENT_FAILED&lang=fr
```

**Comportement :**
- Affiche immédiatement l'erreur
- Pas d'appel API
- Pas de loader

### 3. Cas de succès (paiement réussi)
Si le paiement a réussi, la page de paiement redirige avec `status=success` :

```
callback.html?status=success&transactionId=XXX&merchantId=YYY&lang=fr
```

**Comportement :**
1. Affiche le **loader** immédiatement
2. Appelle l'API backend pour vérifier l'état
3. L'API peut répondre :
   - **`pending`** → Continue le polling (loader reste affiché)
   - **`success`** → Affiche le message de succès puis redirige après 3 secondes
   - **`error`** → Affiche l'erreur

## 📊 États de la Page

### État LOADER
- Spinner animé
- Message "Activation en cours..."
- Appel API en polling toutes les 2 secondes
- Timeout après 60 secondes

### État SUCCÈS
- Icône de succès (checkmark vert)
- Message "Votre abonnement TOD a été activé avec succès !"
- Compte à rebours 3 secondes
- Redirection automatique vers `successUrl`

### État ERREUR
- Icône d'erreur (warning rouge)
- Message d'erreur selon le code
- Pour certains codes : redirection automatique après 5 secondes

## 🔗 Paramètres URL

### Paramètres communs
- `lang` : `fr` ou `ar` (défaut: `fr`)

### Pour erreur directe
- `errorCode` : Code d'erreur (ex: `PAYMENT_FAILED`)

### Pour succès
- `status` : `success` (optionnel, peut être omis)
- `transactionId` : ID de la transaction (requis)
- `merchantId` : ID du marchand (requis)

## 📝 Exemples d'URLs

### Erreur directe
```
callback.html?errorCode=PAYMENT_INSUFFICIENT_FUNDS&lang=fr
callback.html?errorCode=TOD_ACCOUNT_USER_ALREADY_EXISTS&lang=ar
```

### Succès (avec appel API)
```
callback.html?status=success&transactionId=TX123&merchantId=MERCH456&lang=fr
callback.html?transactionId=TX123&merchantId=MERCH456&lang=ar
```

## ⚙️ Configuration API

Dans `js/callback.js`, configurer :

```javascript
const CONFIG = {
    apiEndpoint: 'https://api.tod.example.com/v1/activation/status',
    successUrl: 'https://merchant.example.com/success',
    todRedirectUrl: 'https://tod.example.com/login',
    pollingInterval: 2000,      // 2 secondes
    maxTimeout: 60000,          // 60 secondes max
    successRedirectDelay: 3000  // 3 secondes avant redirection
};
```

## 🔌 Format de Réponse API

L'API doit répondre avec :

```json
{
  "status": "pending" | "success" | "error",
  "errorCode": "TECHNICAL_ERROR"  // Seulement si status === "error"
}
```

### Exemples de réponses

**Pending (continue le polling) :**
```json
{
  "status": "pending"
}
```

**Success (affiche succès) :**
```json
{
  "status": "success"
}
```

**Error (affiche erreur) :**
```json
{
  "status": "error",
  "errorCode": "TOD_ACCOUNT_USER_ALREADY_EXISTS"
}
```

## 🎯 Codes d'Erreur avec Redirection Auto

Ces codes déclenchent une redirection automatique après 5 secondes :
- `TOD_ACCOUNT_USER_ALREADY_EXISTS`
- `TOD_SUB_ALREADY_EXISTS`

Tous les autres codes affichent simplement le message sans redirection.



# TOD - Pages Transactionnelles

Pages frontend statiques pour le service TOD : loader post-paiement et page d'erreur unique.

## 📁 Structure du projet

```
TOD/
├── assets/
│   └── logo.webp             # Logo TOD
├── css/
│   └── styles.css            # Styles communs (responsive, RTL/LTR)
├── js/
│   └── callback.js           # Script pour la page callback unique
├── callback.html             # Page unique (succès/erreur/loader)
├── loader.html               # (Ancienne page - peut être supprimée)
├── error.html                # (Ancienne page - peut être supprimée)
├── FLOW.md                   # Documentation du flow
└── README.md                 # Ce fichier
```

## 🚀 Déploiement

Ces pages sont 100% statiques et peuvent être déployées sur :
- Amazon S3 (Static Website Hosting)
- CloudFront
- Tout autre service d'hébergement statique

### Configuration requise

1. **Logo TOD** : Le logo est déjà en place dans `assets/logo.webp`
2. **Configuration API** : Modifiez les URLs dans `js/callback.js` :
   - `apiEndpoint` : URL de l'API backend TOD
   - `successUrl` : URL de redirection en cas de succès
   - `todRedirectUrl` : URL vers laquelle rediriger pour les cas spécifiques

## 📄 Page Unique : Callback

### Page Callback (`callback.html`)

**Une seule page** gère tous les cas : succès, erreur et chargement.

#### Cas 1 : Erreur directe (paiement échoué)
**URL d'accès** : `callback.html?errorCode=XXX&lang=YYY`

**Paramètres** :
- `errorCode` : Code d'erreur (voir mapping ci-dessous)
- `lang` : `fr` ou `ar` (défaut: `fr`)

**Comportement** :
- Affiche immédiatement l'erreur
- Pas d'appel API
- Pour certains codes, redirection automatique après 5 secondes

#### Cas 2 : Succès (paiement réussi)
**URL d'accès** : `callback.html?status=success&transactionId=XXX&merchantId=YYY&lang=ZZZ`

**Paramètres** :
- `status` : `success` (optionnel)
- `transactionId` : ID de la transaction (requis)
- `merchantId` : ID du marchand (requis)
- `lang` : `fr` ou `ar` (défaut: `fr`)

**Comportement** :
1. Affiche le loader immédiatement
2. Appelle l'API backend en polling
3. L'API répond :
   - `pending` → Continue le polling (loader reste)
   - `success` → Affiche message de succès puis redirige après 3 secondes
   - `error` → Affiche l'erreur

**Voir `FLOW.md` pour plus de détails sur le flow complet.**

## 🗺️ Mapping des erreurs

### Erreurs de paiement
- `PAYMENT_INSUFFICIENT_FUNDS` : Solde insuffisant
- `PAYMENT_FAILED` : Paiement échoué
- `PAYMENT_INVALID_PIN` : Code PIN incorrect

### Erreurs d'authentification TOD
- `TOD_AUTH_INVALID_REQUEST`
- `TOD_AUTH_MISSING_PASSWORD`
- `TOD_AUTH_MISSING_USERNAME`

### Erreurs de compte TOD
- `TOD_ACCOUNT_PHONE_REQUIRED` : Numéro de téléphone manquant
- `TOD_ACCOUNT_PHONE_INVALID` : Numéro de téléphone invalide
- `TOD_ACCOUNT_USER_ALREADY_EXISTS` : **→ Redirection automatique vers TOD**

### Erreurs d'abonnement TOD
- `TOD_SUB_OPTIONID_NOT_FOUND` : Offre non disponible
- `TOD_SUB_EXPIRATION_PAST` : Erreur d'activation
- `TOD_SUB_ALREADY_EXISTS` : **→ Redirection automatique vers TOD**

### Erreur générique
- `TECHNICAL_ERROR` : Erreur technique (fallback)

## 🌐 Support multilingue

- **Français (fr)** : Direction LTR, alignement à gauche
- **Arabe (ar)** : Direction RTL, alignement à droite, police Cairo/Noto Sans Arabic

## 📱 Responsive

Les pages sont optimisées pour :
- Mobile (< 480px)
- Tablette (< 768px)
- Desktop (> 768px)

## ⚙️ Configuration

### Modifier les URLs

**Dans `js/loader.js`** :
```javascript
const CONFIG = {
    apiEndpoint: 'https://api.tod.example.com/v1/activation/status',
    successUrl: 'https://merchant.example.com/success',
    errorPageUrl: 'error.html',
    // ...
};
```

**Dans `js/error-page.js`** :
```javascript
const CONFIG = {
    todRedirectUrl: 'https://tod.example.com/login',
    redirectDelay: 5000
};
```

## 🔒 Sécurité

- Pas de dépendances externes (sauf Google Fonts pour l'arabe)
- Pas de données sensibles dans le code
- Validation des paramètres URL
- Gestion d'erreurs robuste

## 📝 Notes

- Les pages sont entièrement statiques (HTML/CSS/JS vanilla)
- Aucun framework requis
- Compatible avec tous les navigateurs modernes
- Pas de boutons sur la page d'erreur (conformément aux spécifications)


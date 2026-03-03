# Enzi - Registro de comidas con NFC

App PWA para registrar las comidas de Enzo (Border Collie) usando tags NFC. Escaneas el tag, se registra la comida automaticamente, y toda la familia sabe si ya comio.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Lucide Icons + Framer Motion
- **Backend**: Firebase (Firestore, Anonymous Auth, Cloud Functions v2, FCM)
- **Deploy**: Vercel (frontend) + Firebase (backend)

## Setup rapido

### 1. Crear proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/) y crear proyecto "enzi"
2. Activar plan **Blaze** (pay-as-you-go)
3. Habilitar **Authentication** > Sign-in method > **Anonymous**
4. Crear **Cloud Firestore** database (production mode)
5. Ir a **Project Settings** > **General** > bajar hasta "Your apps" > click **Web** (</>) > registrar app "enzi-web"
6. Copiar el config (apiKey, authDomain, etc.)

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con los valores de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=enzi-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=enzi-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=enzi-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_APP_URL=https://enzi.vercel.app
```

### 3. Configurar FCM (Push Notifications)

1. En Firebase Console > **Project Settings** > **Cloud Messaging**
2. En "Web Push certificates" click **Generate key pair**
3. Copiar la VAPID key y agregarla a `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNr...
   ```
4. Editar `public/firebase-messaging-sw.js` y reemplazar los PLACEHOLDER con tu config de Firebase

### 4. Instalar dependencias

```bash
npm install
cd functions && npm install && cd ..
```

### 5. Deploy Firestore rules e indexes

```bash
npx firebase login
npx firebase use --add   # seleccionar tu proyecto
npx firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
npx firebase deploy --only functions
```

### 7. Seed inicial de datos

En Firebase Console > Firestore, crear estos documentos:

**Coleccion `household`, documento `main`:**
```json
{
  "petName": "Enzo",
  "petNickname": "Enzi",
  "petBreed": "Border Collie",
  "alertThresholdMinutes": 480,
  "lastAlertSentAt": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

Los dispensadores y tokens se crean desde la app en `/dispensadores/nuevo`.

### 8. Run local

```bash
npm run dev
```

Abrir http://localhost:3000

### 9. Deploy a Vercel

1. Push el codigo a GitHub
2. Importar repo en [Vercel](https://vercel.com/new)
3. Agregar las variables de entorno en Vercel (Settings > Environment Variables)
4. Deploy automatico

### 10. Grabar tags NFC

1. Ir a `/dispensadores/nuevo` en la app y crear dispensadores (ej: "Comida AM", "Comida PM")
2. Copiar el link generado (ej: `https://enzi.vercel.app/t/abc12345`)
3. Descargar "NFC Tools" en tu celular (Android o iOS)
4. En NFC Tools: **Write** > **Add a record** > **URL/URI** > pegar el link
5. Acercar el tag NFC al celular para grabar
6. Repetir para cada tag/dispensador

## Como funciona

1. **Escaneo NFC**: Un familiar acerca el celular al tag NFC pegado al contenedor de comida
2. **Registro automatico**: El celular abre la URL, la app registra la comida automaticamente (< 2 segundos)
3. **Notificacion**: Los demas familiares reciben una push notification
4. **Dashboard**: Todos pueden ver cuando comio Enzo por ultima vez
5. **Alertas**: Si pasan mas de 8 horas sin comer, se envian alertas push

## Estructura del proyecto

```
src/
  app/              # Paginas (App Router)
    t/[token]/      # Flujo NFC (pagina core)
    historial/      # Historial de comidas
    dispensadores/  # Gestion de tags
    config/         # Configuracion
  components/       # Componentes React
  lib/
    firebase/       # Config y helpers Firebase
    hooks/          # React hooks
    offline/        # Cola IndexedDB + sync
    utils/          # Utilidades
  providers/        # Context providers
functions/          # Cloud Functions (proyecto npm separado)
```

## Cloud Functions

| Funcion | Tipo | Descripcion |
|---------|------|-------------|
| `registerMealByToken` | onCall | Valida token NFC, anti-duplicado, crea evento, envia push |
| `registerManualMeal` | onCall | Registro manual de comida |
| `undoMeal` | onCall | Deshace un evento (ventana de 5 min) |
| `scheduledMealCheck` | onSchedule (30min) | Alerta si Enzo no comio en X horas |

## Seguridad

- **Auth**: Firebase Anonymous Auth (invisible, sin login)
- **Firestore Rules**: Lectura solo para autenticados, escritura de eventos solo via Cloud Functions
- **Anti-duplicado**: Si se escanea el mismo tag 2 veces en 60 segundos, no duplica
- **Rate limiting**: Manejado por Cloud Functions

## Generacion de iconos PWA

Para generar los iconos PNG necesarios:

1. Abrir `public/icons/icon.svg` en un editor
2. Exportar como PNG en 192x192 y 512x512
3. Guardar como `icon-192x192.png` y `icon-512x512.png` en `public/icons/`

O usar un servicio online como [realfavicongenerator.net](https://realfavicongenerator.net/)

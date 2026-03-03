/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// This runs in the background to handle push notifications

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

// Firebase config is injected at build time or hardcoded for the service worker
// Since this is a family app, hardcoding is acceptable
firebase.initializeApp({
  apiKey: "AIzaSyCjMfJmM9DcuDRcB81TEwsMVDUDppnhjDc",
  authDomain: "enzi-app.firebaseapp.com",
  projectId: "enzi-app",
  storageBucket: "enzi-app.firebasestorage.app",
  messagingSenderId: "619065359988",
  appId: "1:619065359988:web:eeb4f4fc6752a05a2e1b21",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Enzi";
  const body = payload.notification?.body || "Nueva actualización";

  const options = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "enzi-meal",
    renotify: true,
    data: {
      url: "/",
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      }),
  );
});

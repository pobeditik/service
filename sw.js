/* Офлайн-кэш страницы (30.10): на кусте связи нет — сайт должен открываться и после перезапуска Safari.
   Страница — сначала из сети (свежая версия), без сети — из кэша. Запросы к базе не кэшируются: данные живут в IndexedDB (site/data.js). */
const C = "service-page-v1";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.add("./").catch(() => {}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.mode !== "navigate" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put("./", cp)); } return res; })
    .catch(() => caches.open(C).then(c => c.match("./")).then(m => m || new Response("Нет связи, и сайт ещё ни разу не открывался на этом устройстве.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }))));
});

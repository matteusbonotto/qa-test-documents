const nomeCache = "qa-docs-studio-v25";
const arquivosEssenciais = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/armazenamentoLocal.js",
  "./js/configuracoes.js",
  "./js/documentacaoTeste.js",
  "./js/execucaoTeste.js",
  "./js/reportBug.js",
  "./js/snippetsQa.js",
  "./js/glossarioQa.js",
  "./js/importadorDados.js",
  "./js/exportadorPdf.js",
  "./js/atalhosTeclado.js",
  "./assets/icons/icon.svg",
  "./vendor/alpine.min.js",
  "./vendor/html2pdf.bundle.min.js",
  "./vendor/lucide.min.js",
  "./vendor/material-icons/material-icons.ttf"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(nomeCache).then((cache) => cache.addAll(arquivosEssenciais))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomesCaches) =>
      Promise.all(nomesCaches.filter((nome) => nome !== nomeCache).map((nome) => caches.delete(nome)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) =>
      respostaCache || fetch(evento.request).then((respostaRede) => {
        const respostaClonada = respostaRede.clone();
        caches.open(nomeCache).then((cache) => cache.put(evento.request, respostaClonada));
        return respostaRede;
      }).catch(() => caches.match("./index.html"))
    )
  );
});

window.atalhosTeclado = (() => {
  function registrar(aplicacao) {
    window.addEventListener("keydown", (evento) => {
      if (!aplicacao.configuracoes.atalhosAtivos) {
        return;
      }

      const tecla = evento.key.toLowerCase();

      if (evento.ctrlKey && tecla === "s") {
        evento.preventDefault();
        aplicacao.salvarRascunho();
      }

      if (evento.ctrlKey && tecla === "d") {
        evento.preventDefault();
        aplicacao.alternarTema();
      }

      if (evento.ctrlKey && evento.key === "Enter") {
        evento.preventDefault();
        aplicacao.gerarDocumentacaoFinal();
      }

      if (evento.ctrlKey && evento.shiftKey && tecla === "c") {
        evento.preventDefault();
        aplicacao.copiarTexto(aplicacao.textoDocumentacaoFinal);
      }

      if (evento.key === "Escape") {
        aplicacao.menuAberto = false;
      }
    });
  }

  return { registrar };
})();

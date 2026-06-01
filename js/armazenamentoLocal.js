window.armazenamentoLocal = (() => {
  const prefixoChave = "qaDocsStudio";

  function montarChave(nomeChave) {
    return `${prefixoChave}:${nomeChave}`;
  }

  function buscar(nomeChave, valorPadrao) {
    const textoSalvo = localStorage.getItem(montarChave(nomeChave));

    if (!textoSalvo) {
      return valorPadrao;
    }

    try {
      return JSON.parse(textoSalvo);
    } catch (erro) {
      console.warn("Falha ao ler dados locais", erro);
      return valorPadrao;
    }
  }

  function salvar(nomeChave, valor) {
    localStorage.setItem(montarChave(nomeChave), JSON.stringify(valor));
  }

  function remover(nomeChave) {
    localStorage.removeItem(montarChave(nomeChave));
  }

  function exportarTudo() {
    const backup = {};

    Object.keys(localStorage)
      .filter((nomeChave) => nomeChave.startsWith(prefixoChave))
      .forEach((nomeChave) => {
        backup[nomeChave.replace(`${prefixoChave}:`, "")] = JSON.parse(localStorage.getItem(nomeChave));
      });

    return backup;
  }

  function importarTudo(backup) {
    Object.entries(backup).forEach(([nomeChave, valor]) => salvar(nomeChave, valor));
  }

  function limparTudo() {
    Object.keys(localStorage)
      .filter((nomeChave) => nomeChave.startsWith(prefixoChave))
      .forEach((nomeChave) => localStorage.removeItem(nomeChave));
  }

  return { buscar, salvar, remover, exportarTudo, importarTudo, limparTudo };
})();

window.execucaoTeste = (() => {
  function criarExecucao(configuracoes = {}) {
    return {
      identificador: crypto.randomUUID(),
      casoTeste: "",
      status: "Em analise",
      comentarios: "",
      evidencias: "",
      dataHora: new Date().toISOString().slice(0, 16),
      executor: configuracoes.nomeProfissional || "",
      ambiente: configuracoes.ambientePadrao || "Homologacao",
      versaoTestada: ""
    };
  }

  function gerarResumo(execucao) {
    return `RESUMO DA EXECUCAO

Caso de teste: ${execucao.casoTeste || "Novo caso"}
Status: ${execucao.status}
Executor: ${execucao.executor || "-"}
Ambiente: ${execucao.ambiente || "-"}
Versao testada: ${execucao.versaoTestada || "-"}
Data e hora: ${execucao.dataHora || "-"}

Comentarios
${execucao.comentarios || "-"}

Evidencias
${execucao.evidencias || "-"}`;
  }

  return { criarExecucao, gerarResumo };
})();

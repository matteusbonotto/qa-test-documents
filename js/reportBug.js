window.reportBug = (() => {
  function formatarValor(valor) {
    return Array.isArray(valor) ? valor.join(", ") : valor;
  }

  function criarBug(configuracoes = {}) {
    return {
      identificador: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      projeto: configuracoes.projetoPadrao || "",
      modulo: "",
      funcionalidade: "",
      titulo: "",
      severidade: "Media",
      prioridade: "Media",
      ambiente: configuracoes.ambientePadrao || "Homologacao",
      versao: "",
      dispositivo: "",
      navegador: "",
      usuarioUtilizado: "",
      massaDados: "",
      preCondicao: "",
      passosReproduzir: "",
      resultadoEsperado: "",
      resultadoObtido: "",
      evidencias: "",
      impacto: "",
      sugestaoCorrecao: "",
      status: "Novo"
    };
  }

  function gerarTexto(bug) {
    return `BUG REPORT

Titulo: ${bug.titulo || "-"}
Projeto: ${bug.projeto || "-"}
Modulo: ${bug.modulo || "-"}
Funcionalidade: ${bug.funcionalidade || "-"}
Severidade: ${formatarValor(bug.severidade) || "-"}
Prioridade: ${formatarValor(bug.prioridade) || "-"}
Status: ${formatarValor(bug.status) || "-"}

Ambiente
Ambiente: ${formatarValor(bug.ambiente) || "-"}
Versao: ${bug.versao || "-"}
Dispositivo: ${formatarValor(bug.dispositivo) || "-"}
Navegador: ${formatarValor(bug.navegador) || "-"}
Usuario utilizado: ${bug.usuarioUtilizado || "-"}

Pre-condicao
${bug.preCondicao || "-"}

Massa de dados
${bug.massaDados || "-"}

Passos para reproduzir
${bug.passosReproduzir || "-"}

Resultado esperado
${bug.resultadoEsperado || "-"}

Resultado obtido
${bug.resultadoObtido || "-"}

Evidencias
${bug.evidencias || "-"}

Impacto
${bug.impacto || "-"}

Sugestao de correcao
${bug.sugestaoCorrecao || "-"}`;
  }

  return { criarBug, gerarTexto };
})();

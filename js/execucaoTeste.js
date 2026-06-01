window.execucaoTeste = (() => {
  function formatarValor(valor) {
    return Array.isArray(valor) ? valor.join(", ") : valor;
  }

  function criarExecucao(configuracoes = {}) {
    return {
      identificador: crypto.randomUUID(),
      qaResponsavelId: "",
      desenvolvedorId: "",
      clienteProjetoId: "",
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
Status: ${formatarValor(execucao.status) || "-"}
Executor: ${execucao.executor || "-"}
Ambiente: ${formatarValor(execucao.ambiente) || "-"}
Versao testada: ${execucao.versaoTestada || "-"}
Data e hora: ${execucao.dataHora || "-"}

Comentarios
${execucao.comentarios || "-"}

Evidencias
${execucao.evidencias || "-"}`;
  }

  function gerarMarkdown(execucao) {
    return `# Execucao de Teste

- **Caso de teste:** ${execucao.casoTeste || "Novo caso"}
- **Status:** ${formatarValor(execucao.status) || "-"}
- **Executor:** ${execucao.executor || "-"}
- **Ambiente:** ${formatarValor(execucao.ambiente) || "-"}
- **Versao testada:** ${execucao.versaoTestada || "-"}
- **Data e hora:** ${execucao.dataHora || "-"}

## Comentarios
${execucao.comentarios || "-"}

## Evidencias
${execucao.evidencias || "-"}`;
  }

  function gerarJira(execucao) {
    return `h2. Execucao de Teste

*Caso de teste:* ${execucao.casoTeste || "Novo caso"}
*Status:* ${formatarValor(execucao.status) || "-"}
*Executor:* ${execucao.executor || "-"}
*Ambiente:* ${formatarValor(execucao.ambiente) || "-"}
*Versao testada:* ${execucao.versaoTestada || "-"}

h3. Comentarios
${execucao.comentarios || "-"}

h3. Evidencias
${execucao.evidencias || "-"}`;
  }

  function gerarHtml(execucao) {
    return `<article>
  <h1>Execucao de Teste</h1>
  <p><strong>Status:</strong> ${formatarValor(execucao.status) || "-"}</p>
  <p><strong>Executor:</strong> ${execucao.executor || "-"}</p>
  <p><strong>Ambiente:</strong> ${formatarValor(execucao.ambiente) || "-"}</p>
  <h2>Comentarios</h2>
  <p>${execucao.comentarios || "-"}</p>
</article>`;
  }

  function gerarTexto(execucao, formato) {
    if (formato === "markdown") return gerarMarkdown(execucao);
    if (formato === "jira") return gerarJira(execucao);
    if (formato === "azure") return gerarMarkdown(execucao).replace("# Execucao de Teste", "# [Execucao de Teste]");
    if (formato === "html") return gerarHtml(execucao);
    return gerarResumo(execucao);
  }

  return { criarExecucao, gerarResumo, gerarTexto };
})();

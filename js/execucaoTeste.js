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
      projetoCliente: "",
      casoTeste: "",
      cenario: "",
      preCondicao: "",
      massaDados: "",
      passosExecutados: "",
      resultadoEsperado: "",
      resultadoObtido: "",
      defeitosVinculados: "",
      reteste: "",
      regressao: "",
      criticidade: "Media",
      tecnicaTeste: "",
      riscosEncontrados: "",
      conclusaoQa: "",
      status: "Nao executado",
      comentarios: "",
      evidencias: "",
      dataHora: new Date().toISOString().slice(0, 16),
      executor: configuracoes.nomeProfissional || "",
      ambiente: configuracoes.ambientePadrao || "Homologacao",
      versaoTestada: ""
    };
  }

  function gerarResumo(execucao) {
    const conclusao = execucao.conclusaoQa || "Com base na execucao realizada no ambiente informado, os principais fluxos foram validados conforme o escopo definido. Os cenarios com falha foram registrados como defeitos e devem ser corrigidos antes da aprovacao final da entrega.";

    return `RESUMO DA EXECUCAO

Projeto/Cliente: ${execucao.projeto || "-"}
Caso de teste: ${execucao.casoTeste || "Novo caso"}
Nome do cenario: ${execucao.cenario || "-"}
Status: ${formatarValor(execucao.status) || "-"}
Executor: ${execucao.executor || "-"}
Ambiente: ${formatarValor(execucao.ambiente) || "-"}
Versao testada: ${execucao.versaoTestada || "-"}
Data e hora: ${execucao.dataHora || "-"}
Criticidade do cenario: ${execucao.criticidade || "-"}
Tecnica aplicada: ${execucao.tecnicaTeste || "-"}

Pre-condicoes
${execucao.preCondicao || "-"}

Massa de dados utilizada
${execucao.massaDados || "-"}

Passos executados
${execucao.passosExecutados || "-"}

Resultado esperado
${execucao.resultadoEsperado || "-"}

Resultado obtido
${execucao.resultadoObtido || "-"}

Defeitos vinculados
${execucao.defeitosVinculados || "-"}

Reteste: ${execucao.reteste || "-"}
Regressao: ${execucao.regressao || "-"}

Principais riscos encontrados
${execucao.riscosEncontrados || "-"}

Comentarios
${execucao.comentarios || "-"}

Evidencias
${execucao.evidencias || "-"}

Conclusao do QA
${conclusao}`;
  }

  function gerarMarkdown(execucao) {
    const conclusao = execucao.conclusaoQa || "Com base na execucao realizada no ambiente informado, os principais fluxos foram validados conforme o escopo definido. Os cenarios com falha foram registrados como defeitos e devem ser corrigidos antes da aprovacao final da entrega.";

    return `# Execucao de Teste

- **Projeto/Cliente:** ${execucao.projeto || "-"}
- **Caso de teste:** ${execucao.casoTeste || "Novo caso"}
- **Cenario:** ${execucao.cenario || "-"}
- **Status:** ${formatarValor(execucao.status) || "-"}
- **Executor:** ${execucao.executor || "-"}
- **Ambiente:** ${formatarValor(execucao.ambiente) || "-"}
- **Versao testada:** ${execucao.versaoTestada || "-"}
- **Data e hora:** ${execucao.dataHora || "-"}
- **Criticidade:** ${execucao.criticidade || "-"}
- **Tecnica aplicada:** ${execucao.tecnicaTeste || "-"}

## Pre-condicoes
${execucao.preCondicao || "-"}

## Massa de dados utilizada
${execucao.massaDados || "-"}

## Passos executados
${execucao.passosExecutados || "-"}

## Resultado esperado
${execucao.resultadoEsperado || "-"}

## Resultado obtido
${execucao.resultadoObtido || "-"}

## Defeitos vinculados
${execucao.defeitosVinculados || "-"}

## Reteste e regressao
- **Reteste:** ${execucao.reteste || "-"}
- **Regressao:** ${execucao.regressao || "-"}

## Riscos encontrados
${execucao.riscosEncontrados || "-"}

## Comentarios
${execucao.comentarios || "-"}

## Evidencias
${execucao.evidencias || "-"}

## Conclusao do QA
${conclusao}`;
  }

  function gerarJira(execucao) {
    return `h2. Execucao de Teste

*Caso de teste:* ${execucao.casoTeste || "Novo caso"}
*Cenario:* ${execucao.cenario || "-"}
*Status:* ${formatarValor(execucao.status) || "-"}
*Executor:* ${execucao.executor || "-"}
*Ambiente:* ${formatarValor(execucao.ambiente) || "-"}
*Versao testada:* ${execucao.versaoTestada || "-"}

h3. Resultado esperado
${execucao.resultadoEsperado || "-"}

h3. Resultado obtido
${execucao.resultadoObtido || "-"}

h3. Defeitos vinculados
${execucao.defeitosVinculados || "-"}

h3. Comentarios
${execucao.comentarios || "-"}

h3. Evidencias
${execucao.evidencias || "-"}`;
  }

  function gerarHtml(execucao) {
    return `<article>
  <h1>Execucao de Teste</h1>
  <p><strong>Projeto/Cliente:</strong> ${execucao.projeto || "-"}</p>
  <p><strong>Status:</strong> ${formatarValor(execucao.status) || "-"}</p>
  <p><strong>Executor:</strong> ${execucao.executor || "-"}</p>
  <p><strong>Ambiente:</strong> ${formatarValor(execucao.ambiente) || "-"}</p>
  <h2>Resultado esperado</h2>
  <p>${execucao.resultadoEsperado || "-"}</p>
  <h2>Resultado obtido</h2>
  <p>${execucao.resultadoObtido || "-"}</p>
  <h2>Conclusao do QA</h2>
  <p>${execucao.conclusaoQa || "-"}</p>
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

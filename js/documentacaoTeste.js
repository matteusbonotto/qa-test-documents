window.documentacaoTeste = (() => {
  function criarPasso() {
    return {
      identificador: crypto.randomUUID(),
      acaoExecutada: "",
      resultadoEsperado: "",
      resultadoObtido: "",
      status: "Nao executado"
    };
  }

  function criarDocumentacao(configuracoes = {}) {
    return {
      identificador: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      qaResponsavelId: "",
      desenvolvedorId: "",
      clienteProjetoId: "",
      projeto: configuracoes.projetoPadrao || "",
      modulo: "",
      funcionalidade: "",
      historiaUsuario: "",
      canal: "Web",
      ambiente: configuracoes.ambientePadrao || "Homologacao",
      prioridade: "Media",
      tiposTeste: ["Funcional"],
      tipoTeste: "Funcional",
      cenario: "",
      preCondicao: "",
      massaDados: "",
      resultadoEsperado: "",
      resultadoObtido: "",
      status: "Nao executado",
      evidencias: "",
      observacoes: "",
      passos: [criarPasso()]
    };
  }

  function gerarCorporativo(documentacao, configuracoes) {
    const tiposTeste = Array.isArray(documentacao.tiposTeste) && documentacao.tiposTeste.length > 0
      ? documentacao.tiposTeste.join(", ")
      : documentacao.tipoTeste || "-";
    const passos = documentacao.passos
      .map((passo, indice) => `${indice + 1}. Acao: ${passo.acaoExecutada || "-"}\n   Esperado: ${passo.resultadoEsperado || "-"}\n   Obtido: ${passo.resultadoObtido || "-"}\n   Status: ${passo.status}`)
      .join("\n\n");

    return `PLANO DE TESTES

Identificacao
Projeto: ${documentacao.projeto || "-"}
Modulo: ${documentacao.modulo || "-"}
Funcionalidade: ${documentacao.funcionalidade || "-"}
Historia de usuario: ${documentacao.historiaUsuario || "-"}
Canal: ${documentacao.canal}
Ambiente: ${documentacao.ambiente || "-"}
Prioridade: ${documentacao.prioridade}
Tipo de teste: ${tiposTeste}
QA responsavel: ${configuracoes.nomeProfissional || "-"}

Objetivo
${documentacao.cenario || "-"}

Pre-condicoes
${documentacao.preCondicao || "-"}

Massa de dados
${documentacao.massaDados || "-"}

Procedimentos de teste
${passos || "-"}

Resultado esperado
${documentacao.resultadoEsperado || "-"}

Resultado obtido
${documentacao.resultadoObtido || "-"}

Evidencias
${documentacao.evidencias || "-"}

Status final
${documentacao.status}

Observacoes
${documentacao.observacoes || "-"}`;
  }

  function gerarMarkdown(documentacao, configuracoes) {
    const tiposTeste = Array.isArray(documentacao.tiposTeste) && documentacao.tiposTeste.length > 0
      ? documentacao.tiposTeste.join(", ")
      : documentacao.tipoTeste || "-";
    const passos = documentacao.passos
      .map((passo, indice) => `| ${indice + 1} | ${passo.acaoExecutada || "-"} | ${passo.resultadoEsperado || "-"} | ${passo.resultadoObtido || "-"} | ${passo.status} |`)
      .join("\n");

    return `# Plano de Testes

## Identificacao
- **Projeto:** ${documentacao.projeto || "-"}
- **Modulo:** ${documentacao.modulo || "-"}
- **Funcionalidade:** ${documentacao.funcionalidade || "-"}
- **Historia de usuario:** ${documentacao.historiaUsuario || "-"}
- **Canal:** ${documentacao.canal}
- **Ambiente:** ${documentacao.ambiente || "-"}
- **Tipo de teste:** ${tiposTeste}
- **QA responsavel:** ${configuracoes.nomeProfissional || "-"}

## Cenario
${documentacao.cenario || "-"}

## Pre-condicoes
${documentacao.preCondicao || "-"}

## Massa de dados
${documentacao.massaDados || "-"}

## Procedimentos
| Passo | Acao | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- |
${passos}

## Resultado esperado
${documentacao.resultadoEsperado || "-"}

## Resultado obtido
${documentacao.resultadoObtido || "-"}

## Evidencias
${documentacao.evidencias || "-"}

## Status final
${documentacao.status}`;
  }

  function gerarJira(documentacao) {
    const tiposTeste = Array.isArray(documentacao.tiposTeste) && documentacao.tiposTeste.length > 0
      ? documentacao.tiposTeste.join(", ")
      : documentacao.tipoTeste || "-";
    const passos = documentacao.passos
      .map((passo, indice) => `#${indice + 1} ${passo.acaoExecutada || "-"} | Esperado: ${passo.resultadoEsperado || "-"} | Obtido: ${passo.resultadoObtido || "-"} | Status: ${passo.status}`)
      .join("\n");

    return `h2. Plano de Testes - ${documentacao.funcionalidade || "Funcionalidade"}

*Projeto:* ${documentacao.projeto || "-"}
*Modulo:* ${documentacao.modulo || "-"}
*Historia:* ${documentacao.historiaUsuario || "-"}
*Ambiente:* ${documentacao.ambiente || "-"}
*Prioridade:* ${documentacao.prioridade}
*Tipo:* ${tiposTeste}

h3. Cenario
${documentacao.cenario || "-"}

h3. Pre-condicoes
${documentacao.preCondicao || "-"}

h3. Passos
${passos}

h3. Resultado esperado
${documentacao.resultadoEsperado || "-"}

h3. Resultado obtido
${documentacao.resultadoObtido || "-"}

h3. Evidencias
${documentacao.evidencias || "-"}

*Status final:* ${documentacao.status}`;
  }

  function gerarAzure(documentacao, configuracoes) {
    return gerarMarkdown(documentacao, configuracoes)
      .replace("# Plano de Testes", "# [Plano de Testes]")
      .replaceAll("## ", "### ");
  }

  function gerarHtml(documentacao, configuracoes) {
    return `<article>
  <h1>Plano de Testes</h1>
  <h2>Identificacao</h2>
  <ul>
    <li><strong>Projeto:</strong> ${documentacao.projeto || "-"}</li>
    <li><strong>Modulo:</strong> ${documentacao.modulo || "-"}</li>
    <li><strong>Funcionalidade:</strong> ${documentacao.funcionalidade || "-"}</li>
    <li><strong>QA:</strong> ${configuracoes.nomeProfissional || "-"}</li>
  </ul>
  <h2>Cenario</h2>
  <p>${documentacao.cenario || "-"}</p>
  <h2>Resultado esperado</h2>
  <p>${documentacao.resultadoEsperado || "-"}</p>
</article>`;
  }

  function gerarTexto(documentacao, configuracoes, formato) {
    if (formato === "markdown") {
      return gerarMarkdown(documentacao, configuracoes);
    }

    if (formato === "jira") {
      return gerarJira(documentacao);
    }

    if (formato === "azure") {
      return gerarAzure(documentacao, configuracoes);
    }

    if (formato === "html") {
      return gerarHtml(documentacao, configuracoes);
    }

    return gerarCorporativo(documentacao, configuracoes);
  }

  return { criarDocumentacao, criarPasso, gerarTexto };
})();

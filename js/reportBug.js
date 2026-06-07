window.reportBug = (() => {
  function formatarValor(valor) {
    return Array.isArray(valor) ? valor.join(", ") : valor;
  }

  function criarBug(configuracoes = {}) {
    return {
      identificador: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      qaResponsavelId: "",
      desenvolvedorId: "",
      clienteProjetoId: "",
      projetoCliente: "",
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
      impactoUsuario: "",
      impactoNegocio: "",
      frequencia: "Sempre ocorre",
      responsavel: "",
      dataAbertura: new Date().toISOString().slice(0, 10),
      criterioAceiteCorrecao: "",
      observacoesTecnicas: "",
      sugestaoCorrecao: "",
      status: "Novo"
    };
  }

  function gerarTexto(bug) {
    return `BUG REPORT

ID do bug: ${bug.identificador || "-"}
Titulo: ${bug.titulo || "-"}
Projeto/Cliente: ${bug.projeto || "-"}
Modulo: ${bug.modulo || "-"}
Funcionalidade: ${bug.funcionalidade || "-"}
Severidade: ${formatarValor(bug.severidade) || "-"}
Prioridade: ${formatarValor(bug.prioridade) || "-"}
Frequencia: ${formatarValor(bug.frequencia) || "-"}
Status: ${formatarValor(bug.status) || "-"}
Responsavel: ${bug.responsavel || "-"}
Data de abertura: ${bug.dataAbertura || bug.criadoEm || "-"}

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
Usuario: ${bug.impactoUsuario || bug.impacto || "-"}
Negocio: ${bug.impactoNegocio || "-"}
Geral: ${bug.impacto || "-"}

Criterio para aceite da correcao
${bug.criterioAceiteCorrecao || "A correcao deve eliminar o comportamento reportado, preservar os fluxos relacionados e permitir reteste com evidencia objetiva."}

Observacoes tecnicas
${bug.observacoesTecnicas || "-"}

Sugestao de correcao
${bug.sugestaoCorrecao || "-"}`;
  }

  function gerarMarkdown(bug) {
    return `# Bug Report

- **ID:** ${bug.identificador || "-"}
- **Titulo:** ${bug.titulo || "-"}
- **Projeto/Cliente:** ${bug.projeto || "-"}
- **Severidade:** ${formatarValor(bug.severidade) || "-"}
- **Prioridade:** ${formatarValor(bug.prioridade) || "-"}
- **Frequencia:** ${formatarValor(bug.frequencia) || "-"}
- **Status:** ${formatarValor(bug.status) || "-"}
- **Ambiente:** ${formatarValor(bug.ambiente) || "-"}
- **Build/versao:** ${bug.versao || "-"}

## Passos para reproduzir
${bug.passosReproduzir || "-"}

## Resultado esperado
${bug.resultadoEsperado || "-"}

## Resultado obtido
${bug.resultadoObtido || "-"}

## Impacto
### Usuario
${bug.impactoUsuario || bug.impacto || "-"}

### Negocio
${bug.impactoNegocio || "-"}

## Criterio de aceite da correcao
${bug.criterioAceiteCorrecao || "A correcao deve eliminar o comportamento reportado, preservar os fluxos relacionados e permitir reteste com evidencia objetiva."}

## Observacoes tecnicas
${bug.observacoesTecnicas || "-"}`;
  }

  function gerarJira(bug) {
    return `h2. Bug Report - ${bug.titulo || "Sem titulo"}

*Projeto/Cliente:* ${bug.projeto || "-"}
*Severidade:* ${formatarValor(bug.severidade) || "-"}
*Prioridade:* ${formatarValor(bug.prioridade) || "-"}
*Frequencia:* ${formatarValor(bug.frequencia) || "-"}
*Status:* ${formatarValor(bug.status) || "-"}

h3. Passos para reproduzir
${bug.passosReproduzir || "-"}

h3. Resultado esperado
${bug.resultadoEsperado || "-"}

h3. Resultado obtido
${bug.resultadoObtido || "-"}`;
  }

  function gerarHtml(bug) {
    return `<article>
  <h1>Bug Report</h1>
  <p><strong>Titulo:</strong> ${bug.titulo || "-"}</p>
  <p><strong>Projeto/Cliente:</strong> ${bug.projeto || "-"}</p>
  <p><strong>Severidade:</strong> ${formatarValor(bug.severidade) || "-"}</p>
  <p><strong>Status:</strong> ${formatarValor(bug.status) || "-"}</p>
  <h2>Resultado obtido</h2>
  <p>${bug.resultadoObtido || "-"}</p>
</article>`;
  }

  function gerarSaida(bug, formato) {
    if (formato === "markdown") return gerarMarkdown(bug);
    if (formato === "jira") return gerarJira(bug);
    if (formato === "azure") return gerarMarkdown(bug).replace("# Bug Report", "# [Bug Report]");
    if (formato === "html") return gerarHtml(bug);
    return gerarTexto(bug);
  }

  return { criarBug, gerarTexto, gerarSaida };
})();

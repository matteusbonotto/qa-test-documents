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
      objetivo: "",
      escopo: "",
      foraDeEscopo: "",
      itensTeste: "",
      tecnicasTeste: "Particao de equivalencia, valor limite e teste exploratorio quando aplicavel",
      criteriosEntrada: "",
      criteriosSaida: "",
      criteriosSuspensaoRetomada: "",
      riscosProduto: "",
      riscosProjeto: "",
      estrategiaExecucao: "",
      evidenciasEsperadas: "",
      ferramentas: "",
      metricasQualidade: "",
      aprovacaoEncerramento: "",
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
    const objetivo = documentacao.objetivo || documentacao.cenario || "-";
    const escopo = documentacao.escopo || documentacao.funcionalidade || "-";
    const criteriosEntrada = documentacao.criteriosEntrada || documentacao.preCondicao || "-";
    const criteriosSaida = documentacao.criteriosSaida || documentacao.resultadoEsperado || "-";
    const evidenciasEsperadas = documentacao.evidenciasEsperadas || documentacao.evidencias || "Evidencias objetivas da execucao, como prints, logs, massa utilizada e links dos defeitos quando houver.";
    const passos = documentacao.passos
      .map((passo, indice) => `${indice + 1}. Acao: ${passo.acaoExecutada || "-"}\n   Esperado: ${passo.resultadoEsperado || "-"}\n   Obtido: ${passo.resultadoObtido || "-"}\n   Status: ${passo.status}`)
      .join("\n\n");

    return `PLANO DE TESTES

Identificacao
Projeto/Cliente: ${documentacao.projeto || "-"}
Modulo: ${documentacao.modulo || "-"}
Funcionalidade: ${documentacao.funcionalidade || "-"}
Historia de usuario: ${documentacao.historiaUsuario || "-"}
Canal: ${documentacao.canal}
Ambiente: ${documentacao.ambiente || "-"}
Prioridade: ${documentacao.prioridade}
Tipo de teste: ${tiposTeste}
QA responsavel: ${configuracoes.nomeProfissional || "-"}

Objetivo
${objetivo}

Contexto e escopo
Este plano define a estrategia de validacao da entrega, considerando o escopo informado, os riscos identificados, os criterios de entrada e saida, os tipos de teste aplicaveis e as evidencias necessarias para apoiar a tomada de decisao sobre a qualidade da versao.

Escopo dos testes
${escopo}

Itens a serem testados
${documentacao.itensTeste || documentacao.funcionalidade || "-"}

Itens fora de escopo
${documentacao.foraDeEscopo || "Nao informado. Qualquer item nao descrito no escopo deve ser alinhado antes da execucao."}

Tecnicas e tipos de teste
Tipos: ${tiposTeste}
Tecnicas: ${documentacao.tecnicasTeste || "-"}

Criterios de entrada
${criteriosEntrada}

Criterios de saida
${criteriosSaida}

Criterios de suspensao e retomada
${documentacao.criteriosSuspensaoRetomada || "Suspender a execucao quando houver bloqueio de ambiente, massa indisponivel ou defeito critico impeditivo. Retomar apos correcao, reteste ou alinhamento formal do risco."}

Massa de dados
${documentacao.massaDados || "-"}

Riscos do produto
${documentacao.riscosProduto || "Avaliar impacto em fluxos criticos, integracoes, dados sensiveis, regras de negocio e experiencia do usuario."}

Riscos do projeto
${documentacao.riscosProjeto || "Monitorar indisponibilidade de ambiente, atraso de build, requisitos incompletos e ausencia de massa de dados representativa."}

Estrategia de execucao
${documentacao.estrategiaExecucao || "Priorizar cenarios por risco e valor de negocio, executar smoke inicial, validar fluxos funcionais, registrar defeitos com evidencias e executar confirmacao/regressao quando aplicavel."}

Procedimentos de teste
${passos || "-"}

Evidencias esperadas
${evidenciasEsperadas}

Ferramentas utilizadas
${documentacao.ferramentas || "Navegador, ambiente de teste, ferramenta de gestao de tarefas/defeitos e repositorio de evidencias."}

Metricas de qualidade
${documentacao.metricasQualidade || "Cobertura por requisito/funcionalidade/risco, status dos cenarios, quantidade de defeitos, severidade, prioridade e taxa de aprovacao."}

Evidencias
${documentacao.evidencias || "-"}

Status final
${documentacao.status}

Observacoes
${documentacao.observacoes || "-"}

Aprovacao ou encerramento
${documentacao.aprovacaoEncerramento || "A conclusao deve considerar criterios de saida, riscos residuais, defeitos pendentes e aceite das partes envolvidas."}`;
  }

  function gerarMarkdown(documentacao, configuracoes) {
    const tiposTeste = Array.isArray(documentacao.tiposTeste) && documentacao.tiposTeste.length > 0
      ? documentacao.tiposTeste.join(", ")
      : documentacao.tipoTeste || "-";
    const passos = documentacao.passos
      .map((passo, indice) => `| ${indice + 1} | ${passo.acaoExecutada || "-"} | ${passo.resultadoEsperado || "-"} | ${passo.resultadoObtido || "-"} | ${passo.status} |`)
      .join("\n");

    const objetivo = documentacao.objetivo || documentacao.cenario || "-";
    const escopo = documentacao.escopo || documentacao.funcionalidade || "-";
    const criteriosEntrada = documentacao.criteriosEntrada || documentacao.preCondicao || "-";
    const criteriosSaida = documentacao.criteriosSaida || documentacao.resultadoEsperado || "-";

    return `# Plano de Testes

## Identificacao
- **Projeto/Cliente:** ${documentacao.projeto || "-"}
- **Modulo:** ${documentacao.modulo || "-"}
- **Funcionalidade:** ${documentacao.funcionalidade || "-"}
- **Historia de usuario:** ${documentacao.historiaUsuario || "-"}
- **Canal:** ${documentacao.canal}
- **Ambiente:** ${documentacao.ambiente || "-"}
- **Tipo de teste:** ${tiposTeste}
- **QA responsavel:** ${configuracoes.nomeProfissional || "-"}

## Objetivo
${objetivo}

## Escopo dos testes
${escopo}

## Itens fora de escopo
${documentacao.foraDeEscopo || "-"}

## Tipos e tecnicas
- **Tipos:** ${tiposTeste}
- **Tecnicas:** ${documentacao.tecnicasTeste || "-"}

## Criterios de entrada
${criteriosEntrada}

## Criterios de saida
${criteriosSaida}

## Criterios de suspensao e retomada
${documentacao.criteriosSuspensaoRetomada || "-"}

## Massa de dados
${documentacao.massaDados || "-"}

## Riscos
- **Produto:** ${documentacao.riscosProduto || "-"}
- **Risco de projeto:** ${documentacao.riscosProjeto || "-"}

## Estrategia de execucao
${documentacao.estrategiaExecucao || "Execucao orientada por risco, valor de negocio, confirmacao de defeitos e regressao quando aplicavel."}

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

## Metricas e encerramento
- **Metricas:** ${documentacao.metricasQualidade || "Cobertura, defeitos, severidade, prioridade e taxa de aprovacao."}
- **Aprovacao/encerramento:** ${documentacao.aprovacaoEncerramento || "-"}

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

*Projeto/Cliente:* ${documentacao.projeto || "-"}
*Modulo:* ${documentacao.modulo || "-"}
*Historia:* ${documentacao.historiaUsuario || "-"}
*Ambiente:* ${documentacao.ambiente || "-"}
*Prioridade:* ${documentacao.prioridade}
*Tipo:* ${tiposTeste}

h3. Objetivo
${documentacao.objetivo || documentacao.cenario || "-"}

h3. Escopo
${documentacao.escopo || documentacao.funcionalidade || "-"}

h3. Criterios de entrada
${documentacao.criteriosEntrada || documentacao.preCondicao || "-"}

h3. Criterios de saida
${documentacao.criteriosSaida || documentacao.resultadoEsperado || "-"}

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
    <li><strong>Projeto/Cliente:</strong> ${documentacao.projeto || "-"}</li>
    <li><strong>Modulo:</strong> ${documentacao.modulo || "-"}</li>
    <li><strong>Funcionalidade:</strong> ${documentacao.funcionalidade || "-"}</li>
    <li><strong>QA:</strong> ${configuracoes.nomeProfissional || "-"}</li>
  </ul>
  <h2>Objetivo</h2>
  <p>${documentacao.objetivo || documentacao.cenario || "-"}</p>
  <h2>Escopo</h2>
  <p>${documentacao.escopo || documentacao.funcionalidade || "-"}</p>
  <h2>Criterios de saida</h2>
  <p>${documentacao.criteriosSaida || documentacao.resultadoEsperado || "-"}</p>
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

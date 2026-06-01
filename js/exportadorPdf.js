window.exportadorPdf = (() => {
  function formatarValor(valor) {
    if (Array.isArray(valor)) {
      return valor.filter(Boolean).join(", ");
    }

    return valor || "";
  }

  function escaparHtml(texto) {
    return String(formatarValor(texto) || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obterClasseStatus(status) {
    const valorStatus = formatarValor(status).toLowerCase();

    if (valorStatus.includes("aprovado") || valorStatus.includes("corrigido") || valorStatus.includes("fechado")) {
      return "pdf-status--sucesso";
    }

    if (valorStatus.includes("reprovado") || valorStatus.includes("critica") || valorStatus.includes("crítica")) {
      return "pdf-status--erro";
    }

    if (valorStatus.includes("bloqueado") || valorStatus.includes("analise") || valorStatus.includes("análise")) {
      return "pdf-status--alerta";
    }

    return "pdf-status--neutro";
  }

  function montarStatus(status) {
    return `<span class="pdf-status ${obterClasseStatus(status)}">${escaparHtml(status || "-")}</span>`;
  }

  function montarCartoesResumo(resumo) {
    return Object.entries(resumo || {})
      .map(([rotulo, valor]) => `
        <article class="pdf-card-resumo">
          <span>${escaparHtml(rotulo)}</span>
          <strong>${escaparHtml(valor || "-")}</strong>
        </article>
      `)
      .join("");
  }

  function montarLinhaCampo(rotulo, valor) {
    return `
      <div class="pdf-campo">
        <span>${escaparHtml(rotulo)}</span>
        <strong>${escaparHtml(valor || "-")}</strong>
      </div>
    `;
  }

  function montarSecaoTexto(titulo, texto) {
    return `
      <section class="pdf-secao">
        <h2>${escaparHtml(titulo)}</h2>
        <p>${escaparHtml(texto || "-")}</p>
      </section>
    `;
  }

  function montarTabelaPassos(passos = []) {
    const linhas = passos.length > 0
      ? passos.map((passo, indice) => `
        <tr>
          <td><strong>${indice + 1}</strong></td>
          <td>${escaparHtml(passo.acaoExecutada || "-")}</td>
          <td>${escaparHtml(passo.resultadoEsperado || "-")}</td>
          <td>${escaparHtml(passo.resultadoObtido || "-")}</td>
          <td>${montarStatus(passo.status)}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="5">Nenhum passo informado.</td></tr>`;

    return `
      <section class="pdf-secao pdf-quebra-evitar">
        <h2>Procedimentos de Teste</h2>
        <table class="pdf-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Acao</th>
              <th>Esperado</th>
              <th>Obtido</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </section>
    `;
  }

  function montarTrilhaInfografico(documento, tipoDocumento) {
    const itens = tipoDocumento === "bug"
      ? [
        ["01", "Contexto", documento.projeto || documento.modulo || "-"],
        ["02", "Impacto", documento.impacto || documento.severidade || "-"],
        ["03", "Reproducao", documento.passosReproduzir ? "Passos informados" : "Nao informado"],
        ["04", "Situacao", documento.status || "-"]
      ]
      : [
        ["01", "Planejamento", documento.tipoTeste || formatarValor(documento.tiposTeste) || "-"],
        ["02", "Execucao", documento.passos?.length ? `${documento.passos.length} passo(s)` : "Sem passos"],
        ["03", "Evidencias", documento.evidencias ? "Registradas" : "Pendentes"],
        ["04", "Resultado", documento.status || "-"]
      ];

    return `
      <section class="pdf-infografico">
        ${itens.map(([numero, titulo, descricao]) => `
          <article>
            <span>${numero}</span>
            <strong>${escaparHtml(titulo)}</strong>
            <p>${escaparHtml(descricao)}</p>
          </article>
        `).join("")}
      </section>
    `;
  }

  function montarDocumentoTeste(documentacao) {
    return `
      <section class="pdf-grid-campos">
        ${montarLinhaCampo("Projeto", documentacao.projeto)}
        ${montarLinhaCampo("Modulo", documentacao.modulo)}
        ${montarLinhaCampo("Funcionalidade", documentacao.funcionalidade)}
        ${montarLinhaCampo("Historia", documentacao.historiaUsuario)}
        ${montarLinhaCampo("Canal", documentacao.canal)}
        ${montarLinhaCampo("Ambiente", documentacao.ambiente)}
        ${montarLinhaCampo("Prioridade", documentacao.prioridade)}
        ${montarLinhaCampo("Tipo de teste", documentacao.tiposTeste || documentacao.tipoTeste)}
      </section>
      ${montarSecaoTexto("Cenario", documentacao.cenario)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Pre-condicoes", documentacao.preCondicao)}
        ${montarSecaoTexto("Massa de Dados", documentacao.massaDados)}
      </section>
      ${montarTabelaPassos(documentacao.passos)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Resultado Esperado", documentacao.resultadoEsperado)}
        ${montarSecaoTexto("Resultado Obtido", documentacao.resultadoObtido)}
      </section>
      ${montarSecaoTexto("Evidencias", documentacao.evidencias)}
      ${montarSecaoTexto("Observacoes", documentacao.observacoes)}
    `;
  }

  function montarBugReport(bug) {
    return `
      <section class="pdf-grid-campos">
        ${montarLinhaCampo("Projeto", bug.projeto)}
        ${montarLinhaCampo("Modulo", bug.modulo)}
        ${montarLinhaCampo("Funcionalidade", bug.funcionalidade)}
        ${montarLinhaCampo("Severidade", bug.severidade)}
        ${montarLinhaCampo("Prioridade", bug.prioridade)}
        ${montarLinhaCampo("Ambiente", bug.ambiente)}
        ${montarLinhaCampo("Versao", bug.versao)}
        ${montarLinhaCampo("Status", bug.status)}
        ${montarLinhaCampo("Dispositivo", bug.dispositivo)}
        ${montarLinhaCampo("Navegador", bug.navegador)}
        ${montarLinhaCampo("Usuario", bug.usuarioUtilizado)}
        ${montarLinhaCampo("Massa de dados", bug.massaDados)}
      </section>
      ${montarSecaoTexto("Pre-condicao", bug.preCondicao)}
      ${montarSecaoTexto("Passos para Reproduzir", bug.passosReproduzir)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Resultado Esperado", bug.resultadoEsperado)}
        ${montarSecaoTexto("Resultado Obtido", bug.resultadoObtido)}
      </section>
      ${montarSecaoTexto("Impacto", bug.impacto)}
      ${montarSecaoTexto("Evidencias", bug.evidencias)}
      ${montarSecaoTexto("Sugestao de Correcao", bug.sugestaoCorrecao)}
    `;
  }

  function montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados }) {
    const geradoEm = new Date().toLocaleString("pt-BR");
    const profissional = configuracoes.nomeProfissional || "QA";
    const empresaCliente = configuracoes.empresaCliente || "QA Docs Studio";
    const cargo = configuracoes.cargo || "QA Engineer";
    const status = tipoDocumento === "bug" ? dados.status : dados.status;
    const logo = configuracoes.logoOpcional ? `<img src="${escaparHtml(configuracoes.logoOpcional)}" alt="" class="pdf-logo" />` : `<div class="pdf-logo-fallback">QA</div>`;
    const conteudo = tipoDocumento === "bug" ? montarBugReport(dados) : montarDocumentoTeste(dados);

    return `
      <article class="documento-pdf">
        <header class="pdf-capa">
          <div class="pdf-capa__marca">
            ${logo}
            <div>
              <span>${escaparHtml(empresaCliente)}</span>
              <strong>QA Docs Studio</strong>
            </div>
          </div>
          <div class="pdf-capa__conteudo">
            <span class="pdf-etiqueta">${tipoDocumento === "bug" ? "Bug report" : "Documentacao de teste"}</span>
            <h1>${escaparHtml(titulo)}</h1>
            <p>${escaparHtml(subtitulo)}</p>
            ${montarStatus(status)}
          </div>
          <div class="pdf-capa__rodape">
            <div><span>Profissional</span><strong>${escaparHtml(profissional)}</strong></div>
            <div><span>Cargo</span><strong>${escaparHtml(cargo)}</strong></div>
            <div><span>Gerado em</span><strong>${geradoEm}</strong></div>
          </div>
        </header>

        <main>
          <section class="pdf-resumo pdf-quebra-evitar">
            <div class="pdf-titulo-secao">
              <span></span>
              <h2>Resumo Executivo</h2>
            </div>
            <div class="pdf-resumo-grid">
              ${montarCartoesResumo(resumo)}
            </div>
          </section>

          ${montarTrilhaInfografico(dados, tipoDocumento)}

          <section class="pdf-conteudo">
            <div class="pdf-titulo-secao">
              <span></span>
              <h2>Detalhamento</h2>
            </div>
            ${conteudo}
          </section>
        </main>

        <footer class="pdf-rodape">
          <span>${escaparHtml(configuracoes.rodapePdf || "Documento gerado localmente para apoio a testes de software.")}</span>
          <strong>${escaparHtml(configuracoes.cabecalhoPdf || "QA Docs Studio")}</strong>
        </footer>
      </article>
    `;
  }

  async function exportar({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados }) {
    const areaPdf = document.createElement("div");
    areaPdf.className = "area-pdf area-pdf--ativa";
    areaPdf.innerHTML = montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados });
    document.body.appendChild(areaPdf);

    const opcoesPdf = {
      margin: 0,
      filename: `${titulo.toLowerCase().replaceAll(" ", "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".pdf-quebra-evitar", ".pdf-card-resumo", ".pdf-campo"] }
    };

    await html2pdf().set(opcoesPdf).from(areaPdf.firstElementChild).save();
    areaPdf.remove();
  }

  return { exportar };
})();

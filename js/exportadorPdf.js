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

  function obterEstadoExecucao(status) {
    const valorStatus = formatarValor(status).toLowerCase();

    if (valorStatus.includes("aprovado") || valorStatus.includes("pass")) {
      return { classe: "sucesso", icone: "✓", rotulo: "Aprovado" };
    }

    if (valorStatus.includes("reprovado") || valorStatus.includes("fail") || valorStatus.includes("falha")) {
      return { classe: "erro", icone: "×", rotulo: "Reprovado" };
    }

    if (valorStatus.includes("bloqueado")) {
      return { classe: "bloqueado", icone: "⊘", rotulo: "Bloqueado" };
    }

    if (valorStatus.includes("pendente") || valorStatus.includes("nao executado") || valorStatus.includes("não executado")) {
      return { classe: "pendente", icone: "◷", rotulo: "Pendente" };
    }

    if (valorStatus.includes("andamento") || valorStatus.includes("analise") || valorStatus.includes("análise")) {
      return { classe: "andamento", icone: "▶", rotulo: "Em andamento" };
    }

    if (valorStatus.includes("cancelado") || valorStatus.includes("cancelada")) {
      return { classe: "cancelado", icone: "⌧", rotulo: "Cancelado" };
    }

    return { classe: "andamento", icone: "▶", rotulo: status || "Em andamento" };
  }

  function montarStatus(status) {
    return `<span class="pdf-status ${obterClasseStatus(status)}">${escaparHtml(status || "-")}</span>`;
  }

  function montarSinalizadorExecucao(status) {
    const estado = obterEstadoExecucao(status);
    return `
      <div class="pdf-sinalizador-execucao pdf-sinalizador-execucao--${estado.classe}">
        <span>${estado.icone}</span>
        <strong>${escaparHtml(formatarValor(status) || estado.rotulo)}</strong>
      </div>
    `;
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

  function montarAvatarPerfil(perfil) {
    if (perfil?.imagemPerfil) {
      return `<img src="${escaparHtml(perfil.imagemPerfil)}" alt="" class="pdf-perfil-avatar" />`;
    }

    const iniciais = String(perfil?.nome || "?").split(" ").filter(Boolean).slice(0, 2).map((parteNome) => parteNome[0]).join("").toUpperCase();
    return `<span class="pdf-perfil-avatar pdf-perfil-avatar--fallback">${escaparHtml(iniciais || "?")}</span>`;
  }

  function montarPerfisRelatorio(perfisSelecionados = {}) {
    const perfis = [
      perfisSelecionados.clienteProjeto ? { titulo: "Cliente / Projeto", ...perfisSelecionados.clienteProjeto } : null,
      perfisSelecionados.qa ? { titulo: "Criador / Executor", ...perfisSelecionados.qa } : null,
      perfisSelecionados.desenvolvedor ? { titulo: "Desenvolvedor", ...perfisSelecionados.desenvolvedor } : null
    ].filter(Boolean);

    if (!perfis.length) {
      return "";
    }

    return `
      <section class="pdf-perfis pdf-quebra-evitar">
        ${perfis.map((perfil) => `
          <article>
            ${montarAvatarPerfil(perfil)}
            <div>
              <span>${escaparHtml(perfil.titulo)}</span>
              <strong>${escaparHtml(perfil.nome)}</strong>
              <p>${escaparHtml(perfil.ocupacao)}</p>
            </div>
          </article>
        `).join("")}
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
      : tipoDocumento === "execucao"
        ? [
        ["01", "Caso", documento.casoTeste || "Novo caso"],
        ["02", "Ambiente", documento.ambiente || "-"],
        ["03", "Executor", documento.executor || "-"],
        ["04", "Resultado", documento.status || "-"]
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
      ${documentacao.camposPersonalizados ? montarSecaoTexto("Campos Personalizados", documentacao.camposPersonalizados) : ""}
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
      ${bug.camposPersonalizados ? montarSecaoTexto("Campos Personalizados", bug.camposPersonalizados) : ""}
    `;
  }

  function montarEvidenciasAnexas(evidencias = []) {
    if (!evidencias.length) {
      return "";
    }

    return `
      <section class="pdf-secao pdf-quebra-evitar">
        <h2>Evidencias Anexadas</h2>
        <div class="pdf-evidencias-grid">
          ${evidencias.map((evidencia) => `
            <article class="pdf-evidencia-card">
              <strong>${escaparHtml(evidencia.nome)}</strong>
              <span>${escaparHtml(evidencia.tipo)} - ${escaparHtml((evidencia.tamanho / 1024 / 1024).toFixed(1))} MB</span>
              ${evidencia.imagem ? `<img src="${evidencia.url}" alt="${escaparHtml(evidencia.nome)}" />` : ""}
              ${evidencia.video || evidencia.gif ? `<a href="${evidencia.url}" download="${escaparHtml(evidencia.nome)}">Baixar video/GIF</a>` : `<a href="${evidencia.url}" download="${escaparHtml(evidencia.nome)}">Baixar evidencia</a>`}
              ${evidencia.partes && evidencia.partes.length ? `<p>Arquivo grande dividido em ${evidencia.partes.length} parte(s) para download.</p>` : ""}
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function montarExecucaoTeste(execucao) {
    return `
      <section class="pdf-execucao-painel">
        <article>
          <span>Status</span>
          <strong>${escaparHtml(execucao.status || "-")}</strong>
        </article>
        <article>
          <span>Executor</span>
          <strong>${escaparHtml(execucao.executor || "-")}</strong>
        </article>
        <article>
          <span>Ambiente</span>
          <strong>${escaparHtml(execucao.ambiente || "-")}</strong>
        </article>
        <article>
          <span>Versao</span>
          <strong>${escaparHtml(execucao.versaoTestada || "-")}</strong>
        </article>
      </section>
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Comentarios da Execucao", execucao.comentarios)}
        ${montarSecaoTexto("Evidencias", execucao.evidencias)}
      </section>
      ${montarSecaoTexto("Caso de Teste Vinculado", execucao.casoTeste || "Novo caso")}
      ${montarSecaoTexto("Data e Hora", execucao.dataHora)}
      ${execucao.camposPersonalizados ? montarSecaoTexto("Campos Personalizados", execucao.camposPersonalizados) : ""}
    `;
  }

  function montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const geradoEm = new Date().toLocaleString("pt-BR");
    const perfis = perfisSelecionados || dados.perfisSelecionados || {};
    const profissional = perfis.qa?.nome || configuracoes.nomeProfissional || "QA";
    const empresaCliente = perfis.clienteProjeto?.nome || configuracoes.empresaCliente || "QA Docs Studio";
    const cargo = perfis.qa?.ocupacao || configuracoes.cargo || "QA Engineer";
    const status = dados.status;
    const logoCliente = perfis.clienteProjeto?.imagemPerfil || configuracoes.logoOpcional;
    const logo = logoCliente ? `<img src="${escaparHtml(logoCliente)}" alt="" class="pdf-logo" />` : `<div class="pdf-logo-fallback">QA</div>`;
    const conteudo = tipoDocumento === "bug" ? montarBugReport(dados) : tipoDocumento === "execucao" ? montarExecucaoTeste(dados) : montarDocumentoTeste(dados);
    const estadoExecucao = tipoDocumento === "execucao" ? obterEstadoExecucao(status) : null;
    const classeTipo = tipoDocumento === "bug" ? "documento-pdf--bug" : tipoDocumento === "execucao" ? `documento-pdf--execucao documento-pdf--execucao-${estadoExecucao.classe}` : "documento-pdf--plano";
    const etiqueta = tipoDocumento === "bug" ? "Bug report" : tipoDocumento === "execucao" ? "Execucao de teste" : "Plano de testes";

    return `
      <article class="documento-pdf ${classeTipo}">
        <header class="pdf-capa">
          <div class="pdf-capa__marca">
            ${logo}
            <div>
              <span>${escaparHtml(empresaCliente)}</span>
              <strong>QA Docs Studio</strong>
            </div>
          </div>
          <div class="pdf-capa__conteudo">
            <span class="pdf-etiqueta">${etiqueta}</span>
            <h1>${escaparHtml(titulo)}</h1>
            <p>${escaparHtml(subtitulo)}</p>
            ${tipoDocumento === "execucao" ? montarSinalizadorExecucao(status) : montarStatus(status)}
          </div>
          <div class="pdf-capa__rodape">
            <div><span>Profissional</span><strong>${escaparHtml(profissional)}</strong></div>
            <div><span>Cargo</span><strong>${escaparHtml(cargo)}</strong></div>
            <div><span>Gerado em</span><strong>${geradoEm}</strong></div>
          </div>
        </header>

        <main class="pdf-corpo">
          <section class="pdf-resumo pdf-quebra-evitar">
            <div class="pdf-titulo-secao">
              <span></span>
              <h2>Resumo Executivo</h2>
            </div>
            <div class="pdf-resumo-grid">
              ${montarCartoesResumo(resumo)}
            </div>
          </section>

          ${montarPerfisRelatorio(perfis)}

          ${montarTrilhaInfografico(dados, tipoDocumento)}

          <section class="pdf-conteudo">
            <div class="pdf-titulo-secao">
              <span></span>
              <h2>Detalhamento</h2>
            </div>
            ${conteudo}
            ${montarEvidenciasAnexas(evidencias)}
          </section>
        </main>

        <footer class="pdf-rodape">
          <span>${escaparHtml(configuracoes.rodapePdf || "Documento gerado localmente para apoio a testes de software.")}</span>
          <strong>${escaparHtml(configuracoes.cabecalhoPdf || "QA Docs Studio")}</strong>
        </footer>
      </article>
    `;
  }

  async function exportar({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const areaPdf = document.createElement("div");
    areaPdf.className = "area-pdf area-pdf--ativa";
    areaPdf.innerHTML = montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados });
    document.body.appendChild(areaPdf);

    const opcoesPdf = {
      margin: 0,
      filename: `${titulo.toLowerCase().replaceAll(" ", "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["css", "legacy"],
        before: [".pdf-quebra-antes"],
        avoid: [".pdf-quebra-evitar", ".pdf-card-resumo", ".pdf-campo", ".pdf-evidencia-card", ".pdf-infografico article"]
      }
    };

    await html2pdf().set(opcoesPdf).from(areaPdf.firstElementChild).save();
    areaPdf.remove();
  }

  return { exportar };
})();

window.exportadorPdf = (() => {
  const larguraA4Mm = 210;
  const alturaA4Mm = 297;
  const larguraA4Px = Math.round(larguraA4Mm * 96 / 25.4);

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

  function criarAreaExportacao({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const areaPdf = document.createElement("div");
    areaPdf.className = "area-pdf area-pdf--ativa";
    areaPdf.style.position = "absolute";
    areaPdf.style.left = "0";
    areaPdf.style.top = "0";
    areaPdf.innerHTML = montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados });
    document.body.appendChild(areaPdf);
    return areaPdf;
  }

  function montarNomeArquivo(titulo, extensao) {
    return `${titulo.toLowerCase().replaceAll(" ", "-")}.${extensao}`;
  }

  function baixarCanvasComoPng(canvas, nomeArquivo) {
    const linkDownload = document.createElement("a");
    linkDownload.href = canvas.toDataURL("image/png");
    linkDownload.download = nomeArquivo;
    linkDownload.click();
  }

  async function renderizarCanvas(documento) {
    aplicarQuebrasInteligentes(documento);

    const larguraRenderizacao = Math.ceil(documento.getBoundingClientRect().width || larguraA4Px);
    const workerCanvas = html2pdf().set({
      html2canvas: {
        scale: 1,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: larguraRenderizacao,
        windowWidth: larguraRenderizacao,
        onclone: (documentoClonado) => {
          documentoClonado.documentElement.style.margin = "0";
          documentoClonado.body.style.margin = "0";
          documentoClonado.body.style.padding = "0";
          documentoClonado.body.style.background = "#ffffff";
        }
      }
    }).from(documento).toCanvas();

    const canvas = await workerCanvas.get("canvas");
    return normalizarCanvasExportado(canvas);
  }

  function aplicarQuebrasInteligentes(documento) {
    removerQuebrasInteligentes(documento);

    const alturaPaginaPx = obterAlturaPaginaPx(documento);
    const seletoresEvitarQuebra = [
      ".pdf-resumo",
      ".pdf-perfis",
      ".pdf-infografico",
      ".pdf-grid-campos",
      ".pdf-grid-dupla",
      ".pdf-execucao-painel",
      ".pdf-secao",
      ".pdf-evidencias-grid",
      ".pdf-evidencia-card",
      ".pdf-rodape"
    ];

    for (let tentativa = 0; tentativa < 6; tentativa += 1) {
      let inseriuQuebra = false;

      documento.querySelectorAll(seletoresEvitarQuebra.join(", ")).forEach((elemento) => {
        if (elemento.dataset.quebraInteligenteAplicada === "true") {
          return;
        }

        const alturaElemento = elemento.getBoundingClientRect().height;

        if (alturaElemento <= 0 || alturaElemento > alturaPaginaPx * 0.82) {
          return;
        }

        const deslocamentoTopo = obterDeslocamentoTopo(documento, elemento);
        const posicaoNaPagina = deslocamentoTopo % alturaPaginaPx;
        const margemSeguranca = 18;
        const cruzaPagina = posicaoNaPagina > margemSeguranca && posicaoNaPagina + alturaElemento > alturaPaginaPx - margemSeguranca;

        if (!cruzaPagina) {
          return;
        }

        inserirEspacadorAntes(elemento, alturaPaginaPx - posicaoNaPagina + 1);
        elemento.dataset.quebraInteligenteAplicada = "true";
        inseriuQuebra = true;
      });

      inserirQuebrasTabela(documento, alturaPaginaPx);

      if (!inseriuQuebra) {
        break;
      }
    }
  }

  function removerQuebrasInteligentes(documento) {
    documento.querySelectorAll(".pdf-quebra-inteligente, .pdf-quebra-inteligente-linha").forEach((elemento) => elemento.remove());
    documento.querySelectorAll("[data-quebra-inteligente-aplicada]").forEach((elemento) => {
      delete elemento.dataset.quebraInteligenteAplicada;
    });
  }

  function obterAlturaPaginaPx(documento) {
    const larguraDocumento = Math.ceil(documento.getBoundingClientRect().width || larguraA4Px);
    return larguraDocumento * alturaA4Mm / larguraA4Mm;
  }

  function obterDeslocamentoTopo(documento, elemento) {
    const caixaDocumento = documento.getBoundingClientRect();
    const caixaElemento = elemento.getBoundingClientRect();
    return caixaElemento.top - caixaDocumento.top;
  }

  function inserirEspacadorAntes(elemento, alturaPx) {
    const espacador = document.createElement("div");
    espacador.className = "pdf-quebra-inteligente";
    espacador.style.height = `${Math.max(0, Math.ceil(alturaPx))}px`;
    espacador.style.minHeight = espacador.style.height;
    espacador.style.gridColumn = "1 / -1";
    espacador.style.breakAfter = "avoid";
    elemento.parentElement.insertBefore(espacador, elemento);
  }

  function inserirQuebrasTabela(documento, alturaPaginaPx) {
    documento.querySelectorAll(".pdf-tabela tbody tr").forEach((linha) => {
      if (linha.dataset.quebraInteligenteAplicada === "true") {
        return;
      }

      const alturaLinha = linha.getBoundingClientRect().height;

      if (alturaLinha <= 0 || alturaLinha > alturaPaginaPx * 0.6) {
        return;
      }

      const deslocamentoTopo = obterDeslocamentoTopo(documento, linha);
      const posicaoNaPagina = deslocamentoTopo % alturaPaginaPx;
      const margemSeguranca = 10;
      const cruzaPagina = posicaoNaPagina > margemSeguranca && posicaoNaPagina + alturaLinha > alturaPaginaPx - margemSeguranca;

      if (!cruzaPagina) {
        return;
      }

      const quantidadeColunas = linha.closest("table")?.querySelectorAll("thead th").length || linha.children.length || 1;
      const linhaEspacadora = document.createElement("tr");
      linhaEspacadora.className = "pdf-quebra-inteligente-linha";
      const celula = document.createElement("td");
      celula.colSpan = quantidadeColunas;
      celula.style.height = `${Math.max(0, Math.ceil(alturaPaginaPx - posicaoNaPagina + 1))}px`;
      celula.style.padding = "0";
      celula.style.border = "0";
      celula.style.background = "#ffffff";
      linhaEspacadora.appendChild(celula);
      linha.parentElement.insertBefore(linhaEspacadora, linha);
      linha.dataset.quebraInteligenteAplicada = "true";
    });
  }

  function normalizarCanvasExportado(canvas) {
    const contexto = canvas.getContext("2d", { willReadFrequently: true });
    const largura = canvas.width;
    const altura = canvas.height;
    const passo = Math.max(1, Math.floor(largura / 400));
    const dados = contexto.getImageData(0, 0, largura, altura).data;
    let primeiroX = largura;
    let ultimoX = 0;

    for (let y = 0; y < altura; y += passo) {
      for (let x = 0; x < largura; x += passo) {
        const indice = (y * largura + x) * 4;
        const alpha = dados[indice + 3];
        const pixelNaoBranco = alpha > 10 && (dados[indice] < 250 || dados[indice + 1] < 250 || dados[indice + 2] < 250);

        if (pixelNaoBranco) {
          primeiroX = Math.min(primeiroX, x);
          ultimoX = Math.max(ultimoX, x);
        }
      }
    }

    if (primeiroX >= ultimoX) {
      return canvas;
    }

    const margem = Math.max(2, passo * 2);
    const origemX = Math.max(0, primeiroX - margem);
    const larguraConteudo = Math.min(largura - origemX, ultimoX - origemX + margem * 2);

    if (larguraConteudo >= largura * 0.9) {
      return canvas;
    }

    const canvasNormalizado = document.createElement("canvas");
    canvasNormalizado.width = larguraConteudo;
    canvasNormalizado.height = altura;
    canvasNormalizado.getContext("2d").drawImage(canvas, origemX, 0, larguraConteudo, altura, 0, 0, larguraConteudo, altura);
    return canvasNormalizado;
  }

  async function exportar({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const areaPdf = criarAreaExportacao({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados });
    const canvas = await renderizarCanvas(areaPdf.firstElementChild);

    const pdf = await criarPdfA4();
    adicionarCanvasAoPdf(pdf, canvas);
    pdf.save(montarNomeArquivo(titulo, "pdf"));
    areaPdf.remove();
  }

  async function criarPdfA4() {
    const elementoBase = document.createElement("div");
    elementoBase.style.width = "1px";
    elementoBase.style.height = "1px";
    elementoBase.style.overflow = "hidden";
    document.body.appendChild(elementoBase);

    const workerPdf = html2pdf()
      .set({
        margin: 0,
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true }
      })
      .from(elementoBase)
      .toPdf();
    const pdf = await workerPdf.get("pdf");

    elementoBase.remove();
    return pdf;
  }

  function adicionarCanvasAoPdf(pdf, canvas) {
    const alturaFatiaPx = Math.floor(canvas.width * alturaA4Mm / larguraA4Mm);
    let posicaoY = 0;
    let indicePagina = 0;

    while (posicaoY < canvas.height) {
      const alturaFatiaAtual = Math.min(alturaFatiaPx, canvas.height - posicaoY);
      const canvasPagina = document.createElement("canvas");
      canvasPagina.width = canvas.width;
      canvasPagina.height = alturaFatiaAtual;
      canvasPagina.getContext("2d").drawImage(
        canvas,
        0,
        posicaoY,
        canvas.width,
        alturaFatiaAtual,
        0,
        0,
        canvas.width,
        alturaFatiaAtual
      );

      if (indicePagina > 0) {
        pdf.addPage("a4", "portrait");
      } else {
        pdf.setPage(1);
      }

      const alturaImagemMm = alturaFatiaAtual * larguraA4Mm / canvas.width;
      pdf.addImage(canvasPagina.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, larguraA4Mm, alturaImagemMm);
      posicaoY += alturaFatiaAtual;
      indicePagina += 1;
    }
  }

  async function exportarPng({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const areaPdf = criarAreaExportacao({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados });
    const canvas = await renderizarCanvas(areaPdf.firstElementChild);

    baixarCanvasComoPng(canvas, montarNomeArquivo(titulo, "png"));
    areaPdf.remove();
  }

  return { exportar, exportarPng };
})();

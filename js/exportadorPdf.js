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

    if (valorStatus.includes("aprovado") || valorStatus.includes("pass") || valorStatus.includes("corrigido") || valorStatus.includes("fechado")) {
      return "pdf-status--sucesso";
    }

    if (valorStatus.includes("reprovado") || valorStatus.includes("falhou") || valorStatus.includes("fail") || valorStatus.includes("critica") || valorStatus.includes("crítica")) {
      return "pdf-status--erro";
    }

    if (valorStatus.includes("bloqueado") || valorStatus.includes("execucao") || valorStatus.includes("execução") || valorStatus.includes("analise") || valorStatus.includes("análise")) {
      return "pdf-status--alerta";
    }

    return "pdf-status--neutro";
  }

  function obterEstadoExecucao(status) {
    const valorStatus = formatarValor(status).toLowerCase();

    if (valorStatus.includes("aprovado") || valorStatus.includes("pass")) {
      return { classe: "sucesso", icone: "✓", rotulo: "Passou" };
    }

    if (valorStatus.includes("reprovado") || valorStatus.includes("falhou") || valorStatus.includes("fail") || valorStatus.includes("falha")) {
      return { classe: "erro", icone: "×", rotulo: "Falhou" };
    }

    if (valorStatus.includes("bloqueado")) {
      return { classe: "bloqueado", icone: "⊘", rotulo: "Bloqueado" };
    }

    if (valorStatus.includes("pendente") || valorStatus.includes("nao executado") || valorStatus.includes("não executado")) {
      return { classe: "pendente", icone: "◷", rotulo: "Pendente" };
    }

    if (valorStatus.includes("andamento") || valorStatus.includes("execucao") || valorStatus.includes("execução") || valorStatus.includes("analise") || valorStatus.includes("análise")) {
      return { classe: "andamento", icone: "▶", rotulo: "Em execucao" };
    }

    if (valorStatus.includes("cancelado") || valorStatus.includes("cancelada") || valorStatus.includes("nao aplicavel") || valorStatus.includes("não aplicável")) {
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

  function montarAvatarQa(perfil) {
    if (perfil?.imagemPerfil) {
      return `<img src="${escaparHtml(perfil.imagemPerfil)}" alt="" class="pdf-qa-avatar" />`;
    }

    const iniciais = String(perfil?.nome || "QA").split(" ").filter(Boolean).slice(0, 2).map((parteNome) => parteNome[0]).join("").toUpperCase();
    return `<span class="pdf-qa-avatar pdf-qa-avatar--fallback">${escaparHtml(iniciais || "QA")}</span>`;
  }

  function montarPerfisRelatorio(perfisSelecionados = {}) {
    const perfis = [
      perfisSelecionados.clienteProjeto ? { titulo: "Cliente / Projeto", ...perfisSelecionados.clienteProjeto } : null,
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

  function montarDocumentoTeste(documentacao) {
    return `
      ${documentacao.historiaUsuario || documentacao.canal ? `
        <section class="pdf-grid-campos">
          ${montarLinhaCampo("Historia", documentacao.historiaUsuario)}
          ${montarLinhaCampo("Canal", documentacao.canal)}
        </section>
      ` : ""}
      ${montarSecaoTexto("Objetivo", documentacao.objetivo || documentacao.cenario)}
      ${montarSecaoTexto("Escopo dos Testes", documentacao.escopo || documentacao.funcionalidade)}
      ${montarSecaoTexto("Itens Fora de Escopo", documentacao.foraDeEscopo)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Criterios de Entrada", documentacao.criteriosEntrada || documentacao.preCondicao)}
        ${montarSecaoTexto("Criterios de Saida", documentacao.criteriosSaida || documentacao.resultadoEsperado)}
      </section>
      ${montarSecaoTexto("Tecnicas e Estrategia", [documentacao.tecnicasTeste, documentacao.estrategiaExecucao].filter(Boolean).join("\n"))}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Pre-condicoes", documentacao.preCondicao)}
        ${montarSecaoTexto("Massa de Dados", documentacao.massaDados)}
      </section>
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Riscos do Produto", documentacao.riscosProduto)}
        ${montarSecaoTexto("Riscos do Projeto", documentacao.riscosProjeto)}
      </section>
      ${montarTabelaPassos(documentacao.passos)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Resultado Esperado", documentacao.resultadoEsperado)}
        ${montarSecaoTexto("Resultado Obtido", documentacao.resultadoObtido)}
      </section>
      ${montarSecaoTexto("Evidencias", documentacao.evidencias)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Ferramentas", documentacao.ferramentas)}
        ${montarSecaoTexto("Metricas de Qualidade", documentacao.metricasQualidade)}
      </section>
      ${montarSecaoTexto("Observacoes", documentacao.observacoes)}
      ${montarSecaoTexto("Aprovacao ou Encerramento", documentacao.aprovacaoEncerramento)}
      ${documentacao.camposPersonalizados ? montarSecaoTexto("Campos Personalizados", documentacao.camposPersonalizados) : ""}
    `;
  }

  function montarBugReport(bug) {
    return `
      <section class="pdf-grid-campos">
        ${montarLinhaCampo("Versao", bug.versao)}
        ${montarLinhaCampo("Dispositivo", bug.dispositivo)}
        ${montarLinhaCampo("Navegador", bug.navegador)}
        ${montarLinhaCampo("Usuario", bug.usuarioUtilizado)}
        ${montarLinhaCampo("Frequencia", bug.frequencia)}
        ${montarLinhaCampo("Responsavel", bug.responsavel)}
        ${montarLinhaCampo("Data abertura", bug.dataAbertura)}
        ${montarLinhaCampo("Massa de dados", bug.massaDados)}
      </section>
      ${montarSecaoTexto("Pre-condicao", bug.preCondicao)}
      ${montarSecaoTexto("Passos para Reproduzir", bug.passosReproduzir)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Resultado Esperado", bug.resultadoEsperado)}
        ${montarSecaoTexto("Resultado Obtido", bug.resultadoObtido)}
      </section>
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Impacto no Usuario", bug.impactoUsuario || bug.impacto)}
        ${montarSecaoTexto("Impacto no Negocio", bug.impactoNegocio)}
      </section>
      ${montarSecaoTexto("Impacto Geral", bug.impacto)}
      ${montarSecaoTexto("Evidencias", bug.evidencias)}
      ${montarSecaoTexto("Criterio de Aceite da Correcao", bug.criterioAceiteCorrecao)}
      ${montarSecaoTexto("Observacoes Tecnicas", bug.observacoesTecnicas)}
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
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Cenario", execucao.cenario)}
        ${montarSecaoTexto("Criticidade e Tecnica", [execucao.criticidade, execucao.tecnicaTeste].filter(Boolean).join(" - "))}
      </section>
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Pre-condicoes", execucao.preCondicao)}
        ${montarSecaoTexto("Massa de Dados", execucao.massaDados)}
      </section>
      ${montarSecaoTexto("Passos Executados", execucao.passosExecutados)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Resultado Esperado", execucao.resultadoEsperado)}
        ${montarSecaoTexto("Resultado Obtido", execucao.resultadoObtido)}
      </section>
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Defeitos Vinculados", execucao.defeitosVinculados)}
        ${montarSecaoTexto("Reteste e Regressao", [execucao.reteste ? `Reteste: ${execucao.reteste}` : "", execucao.regressao ? `Regressao: ${execucao.regressao}` : ""].filter(Boolean).join("\n"))}
      </section>
      ${montarSecaoTexto("Riscos Encontrados", execucao.riscosEncontrados)}
      <section class="pdf-grid-dupla">
        ${montarSecaoTexto("Comentarios da Execucao", execucao.comentarios)}
        ${montarSecaoTexto("Evidencias", execucao.evidencias)}
      </section>
      ${montarSecaoTexto("Caso de Teste Vinculado", execucao.casoTeste || "Novo caso")}
      ${montarSecaoTexto("Data e Hora", execucao.dataHora)}
      ${montarSecaoTexto("Conclusao do QA", execucao.conclusaoQa)}
      ${execucao.camposPersonalizados ? montarSecaoTexto("Campos Personalizados", execucao.camposPersonalizados) : ""}
    `;
  }

  function montarDocumentoPdf({ titulo, subtitulo, configuracoes, resumo, tipoDocumento, dados, evidencias, perfisSelecionados }) {
    const geradoEm = new Date().toLocaleString("pt-BR");
    const perfis = perfisSelecionados || dados.perfisSelecionados || {};
    const contextoHeader = tipoDocumento === "bug" ? "bug" : tipoDocumento === "execucao" ? "execucao" : "documentacao";
    const headerConfig = configuracoes.impressaoHeaders?.[contextoHeader] || {};
    const profissional = perfis.qa?.nome || configuracoes.nomeProfissional || "QA";
    const cargo = perfis.qa?.ocupacao || configuracoes.cargo || "QA Engineer";
    const status = dados.status;
    const conteudo = tipoDocumento === "bug" ? montarBugReport(dados) : tipoDocumento === "execucao" ? montarExecucaoTeste(dados) : montarDocumentoTeste(dados);
    const estadoExecucao = tipoDocumento === "execucao" ? obterEstadoExecucao(status) : null;
    const classeTipo = tipoDocumento === "bug" ? "documento-pdf--bug" : tipoDocumento === "execucao" ? `documento-pdf--execucao documento-pdf--execucao-${estadoExecucao.classe}` : "documento-pdf--plano";
    const etiqueta = headerConfig.titulo || (tipoDocumento === "bug" ? "Bug report" : tipoDocumento === "execucao" ? "Execucao de teste" : "Plano de testes");
    const iconeHeader = headerConfig.icone || "QA";
    const tituloRelatorio = subtitulo || titulo;
    const identificador = dados.identificador || "-";
    const corPrimaria = headerConfig.corPrimaria || "#172033";
    const corSecundaria = headerConfig.corSecundaria || "#2563eb";

    return `
      <article class="documento-pdf ${classeTipo}" style="--pdf-header-cor-1: ${escaparHtml(corPrimaria)}; --pdf-header-cor-2: ${escaparHtml(corSecundaria)};">
        <header class="pdf-capa pdf-capa--compacta">
          <div class="pdf-capa__topo">
            <div class="pdf-capa__qa">
              ${montarAvatarQa(perfis.qa)}
              <div>
                <span>QA</span>
                <strong>${escaparHtml(profissional)}</strong>
                <p>${escaparHtml(cargo)}</p>
              </div>
            </div>
            <div class="pdf-capa__meta">
              <div><span>Data e hora</span><strong>${geradoEm}</strong></div>
              <div><span>ID unico</span><strong>${escaparHtml(identificador)}</strong></div>
            </div>
          </div>
          <div class="pdf-capa__conteudo">
            <span class="pdf-etiqueta"><b>${escaparHtml(iconeHeader)}</b>${escaparHtml(etiqueta)}</span>
            <h1>${escaparHtml(tituloRelatorio)}</h1>
            ${tipoDocumento === "execucao" ? montarSinalizadorExecucao(status) : montarStatus(status)}
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

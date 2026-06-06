function qaDocsStudio() {
  return {
    telaAtual: "dashboard",
    menuAberto: false,
    abaDocumentacao: "identificacao",
    formatoSaida: "markdown",
    formatoSaidaExecucao: "markdown",
    formatoSaidaBug: "markdown",
    textoDocumentacaoFinal: "",
    opcaoPersonalizada: {
      canal: "",
      ambiente: "",
      prioridade: "",
      tipoTeste: "",
      statusTeste: "",
      dispositivo: "",
      navegador: "",
      severidade: "",
      statusBug: ""
    },
    outroAtivo: {},
    abasDocumentacao: [
      { identificador: "identificacao", nome: "Identificacao", icone: "fingerprint" },
      { identificador: "planejamento", nome: "Planejamento", icone: "map" },
      { identificador: "procedimentos", nome: "Passos", icone: "list-checks" },
      { identificador: "resultado", nome: "Resultado", icone: "badge-check" }
    ],
    opcoesCanal: ["Web", "Mobile", "API", "Desktop"],
    opcoesAmbiente: ["Desenvolvimento", "Homologacao", "Staging", "Producao"],
    opcoesPrioridade: ["Baixa", "Media", "Alta", "Critica"],
    opcoesTipoTeste: ["Funcional", "Regressivo", "Smoke", "Exploratorio", "Integracao", "Usabilidade", "API", "Responsivo", "Seguranca"],
    opcoesStatusTeste: ["Nao executado", "Aprovado", "Reprovado", "Bloqueado", "Em analise"],
    opcoesStatusBug: ["Novo", "Em analise", "Corrigido", "Reteste", "Fechado"],
    opcoesSeveridade: ["Baixa", "Media", "Alta", "Critica"],
    opcoesDispositivo: ["Desktop", "Notebook", "Android", "iOS", "Tablet"],
    opcoesNavegador: ["Chrome", "Edge", "Firefox", "Safari", "Mobile Web"],
    buscaSnippet: "",
    buscaGlossario: "",
    arquivoImportacao: null,
    errosImportacao: [],
    tipoTemplateSelecionado: "documentacoes",
    novaOpcaoGrupo: {},
    novoGrupoOpcao: { nome: "", campo: "", selecaoMultipla: false, obrigatorio: true },
    novoCampoPersonalizado: { nome: "", chave: "", tipo: "texto", destino: "todos", grupoCampo: "", obrigatorio: false },
    acordeonsGrupos: {},
    novoQa: { nome: "", ocupacao: "QA Engineer", imagemPerfil: "" },
    novoDesenvolvedor: { nome: "", ocupacao: "Desenvolvedor", imagemPerfil: "" },
    novoClienteProjeto: { nome: "", ocupacao: "Cliente / Projeto", imagemPerfil: "" },
    camposPersonalizadosValores: {
      documentacao: {},
      execucao: {},
      bug: {}
    },
    passoArrastadoIndice: null,
    limiteParteBytes: 25 * 1024 * 1024,
    limiteMidiaHtmlBytes: 60 * 1024 * 1024,
    toast: { visivel: false, mensagem: "" },
    telas: [
      { identificador: "dashboard", nome: "Dashboard", icone: "layout-dashboard" },
      { identificador: "documentacao", nome: "Documentacao", icone: "file-text" },
      { identificador: "execucao", nome: "Execucao", icone: "clipboard-check" },
      { identificador: "bug", nome: "Bug Report", icone: "bug" },
      { identificador: "snippets", nome: "Snippets", icone: "copy" },
      { identificador: "glossario", nome: "Glossario", icone: "book-open" },
      { identificador: "atalhos", nome: "Atalhos", icone: "keyboard" },
      { identificador: "configuracoes", nome: "Configuracoes", icone: "settings" }
    ],
    configuracoes: window.configuracoesQa.criarConfiguracoes(),
    documentacao: window.documentacaoTeste.criarDocumentacao(window.configuracoesQa.criarConfiguracoes()),
    execucao: window.execucaoTeste.criarExecucao(window.configuracoesQa.criarConfiguracoes()),
    bug: window.reportBug.criarBug(window.configuracoesQa.criarConfiguracoes()),
    snippetEdicao: window.snippetsQa.criarSnippet(),
    termoGlossarioEdicao: window.glossarioQa.criarTermo(),
    documentacoesCriadas: [],
    execucoesRegistradas: [],
    bugsReportados: [],
    snippets: [],
    glossario: [],
    historicoLocal: [],
    evidenciaArquivos: {
      documentacao: [],
      execucao: [],
      bug: []
    },

    iniciarAplicacao() {
      this.configuracoes = window.configuracoesQa.normalizarConfiguracoes(window.armazenamentoLocal.buscar("configuracoes", window.configuracoesQa.criarConfiguracoes()));
      this.sincronizarOpcoesConfiguradas();
      this.documentacoesCriadas = window.armazenamentoLocal.buscar("documentacoes", []);
      this.execucoesRegistradas = window.armazenamentoLocal.buscar("execucoes", []);
      this.bugsReportados = window.armazenamentoLocal.buscar("bugs", []);
      this.snippets = window.armazenamentoLocal.buscar("snippets", window.snippetsQa.criarSnippetsPadrao());
      this.glossario = window.armazenamentoLocal.buscar("glossario", window.glossarioQa.criarGlossarioPadrao());
      this.historicoLocal = window.armazenamentoLocal.buscar("historico", []);
      this.documentacao = window.armazenamentoLocal.buscar("rascunhoDocumentacao", window.documentacaoTeste.criarDocumentacao(this.configuracoes));
      this.normalizarDocumentacao();
      this.execucao = window.armazenamentoLocal.buscar("rascunhoExecucao", window.execucaoTeste.criarExecucao(this.configuracoes));
      this.bug = window.armazenamentoLocal.buscar("rascunhoBug", window.reportBug.criarBug(this.configuracoes));
      this.formatoSaida = this.configuracoes.modeloPadrao || "markdown";
      this.formatoSaidaExecucao = this.configuracoes.modeloPadrao || "markdown";
      this.formatoSaidaBug = this.configuracoes.modeloPadrao || "markdown";
      this.gerarDocumentacaoFinal(false);
      window.atalhosTeclado.registrar(this);
      this.registrarServiceWorker();
      this.atualizarIcones();
    },

    get tituloTela() {
      const telaSelecionada = this.telas.find((tela) => tela.identificador === this.telaAtual);
      return telaSelecionada ? telaSelecionada.nome : "QA Docs Studio";
    },

    get ultimasDocumentacoes() {
      return [...this.documentacoesCriadas].slice(-5).reverse();
    },

    get resumoExecucao() {
      const textoBase = window.execucaoTeste.gerarTexto(this.execucao, this.formatoSaidaExecucao);
      const campos = this.textoCamposPersonalizados("execucao");
      const perfis = this.textoPerfisSelecionados("execucao");
      return [textoBase, perfis ? `\nPerfis envolvidos\n${perfis}` : "", campos ? `\nCampos personalizados\n${campos}` : ""].filter(Boolean).join("\n");
    },

    get textoBugReport() {
      const textoBase = window.reportBug.gerarSaida(this.bug, this.formatoSaidaBug);
      const campos = this.textoCamposPersonalizados("bug");
      const perfis = this.textoPerfisSelecionados("bug");
      return [textoBase, perfis ? `\nPerfis envolvidos\n${perfis}` : "", campos ? `\nCampos personalizados\n${campos}` : ""].filter(Boolean).join("\n");
    },

    get htmlMarkdownDocumentacao() {
      return this.renderizarPrevia(this.textoDocumentacaoFinal || "A documentacao formatada aparecera aqui.", this.formatoSaida);
    },

    get htmlPreviaExecucao() {
      return this.renderizarPrevia(this.resumoExecucao, this.formatoSaidaExecucao);
    },

    get htmlPreviaBug() {
      return this.renderizarPrevia(this.textoBugReport, this.formatoSaidaBug);
    },

    get snippetsFiltrados() {
      const busca = this.buscaSnippet.trim().toLowerCase();

      if (!busca) {
        return this.snippets;
      }

      return this.snippets.filter((snippet) =>
        [snippet.titulo, snippet.categoria, snippet.descricao, snippet.tags].join(" ").toLowerCase().includes(busca)
      );
    },

    get glossarioFiltrado() {
      const busca = this.buscaGlossario.trim().toLowerCase();

      if (!busca) {
        return this.glossario;
      }

      return this.glossario.filter((termo) =>
        [termo.nome, termo.definicao, termo.exemplo, termo.categoria].join(" ").toLowerCase().includes(busca)
      );
    },

    trocarTela(identificadorTela) {
      this.telaAtual = identificadorTela;
      this.menuAberto = false;
      this.atualizarIcones();
    },

    atualizarIcones() {
      this.$nextTick(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    },

    sincronizarOpcoesConfiguradas() {
      this.opcoesCanal = this.obterRotulosGrupo("canal");
      this.opcoesAmbiente = this.obterRotulosGrupo("ambiente");
      this.opcoesPrioridade = this.obterRotulosGrupo("prioridade");
      this.opcoesTipoTeste = this.obterRotulosGrupo("tiposTeste");
      this.opcoesStatusTeste = this.obterRotulosGrupo("statusTeste");
      this.opcoesStatusBug = this.obterRotulosGrupo("statusBug");
      this.opcoesSeveridade = this.obterRotulosGrupo("severidade");
      this.opcoesDispositivo = this.obterRotulosGrupo("dispositivo");
      this.opcoesNavegador = this.obterRotulosGrupo("navegador");
    },

    obterGrupoOpcoes(campo) {
      return this.configuracoes.gruposOpcoes.find((grupo) => grupo.campo === campo);
    },

    obterRotulosGrupo(campo) {
      const grupo = this.obterGrupoOpcoes(campo);
      return grupo ? grupo.opcoes.map((opcao) => opcao.rotulo).filter(Boolean) : [];
    },

    obterOpcoesGrupo(campo) {
      const grupo = this.obterGrupoOpcoes(campo);
      return grupo ? grupo.opcoes.filter((opcao) => opcao.rotulo) : [];
    },

    obterOpcaoGrupo(campo, rotulo) {
      return this.obterOpcoesGrupo(campo).find((opcao) => opcao.rotulo === rotulo) || {};
    },

    obterIconeOpcao(campo, rotulo) {
      const opcao = this.obterOpcaoGrupo(campo, rotulo);
      return opcao.icone || this.iconePadraoOpcao(rotulo);
    },

    obterImagemOpcao(campo, rotulo) {
      return this.obterOpcaoGrupo(campo, rotulo).imagem || "";
    },

    obterCamposPersonalizados(contexto) {
      return this.configuracoes.camposPersonalizados.filter((campo) => campo.destino === "todos" || campo.destino === contexto);
    },

    obterGruposPersonalizados() {
      const gruposBase = ["canal", "ambiente", "prioridade", "tiposTeste", "statusTeste", "statusBug", "severidade", "dispositivo", "navegador"];
      return this.configuracoes.gruposOpcoes.filter((grupo) => !gruposBase.includes(grupo.campo));
    },

    obterCamposFormulario(contexto) {
      const campos = this.obterCamposPersonalizados(contexto);
      const chavesCampos = campos.map((campo) => campo.chave);
      const gruposComoCampos = this.obterGruposPersonalizados()
        .filter((grupo) => !chavesCampos.includes(grupo.campo))
        .map((grupo) => ({
          identificador: `grupo-${grupo.identificador}`,
          nome: grupo.nome,
          chave: grupo.campo,
          tipo: "botoes",
          destino: "todos",
          grupoCampo: grupo.campo,
          obrigatorio: grupo.obrigatorio
        }));

      return [...campos, ...gruposComoCampos];
    },

    classeOpcao(rotulo) {
      const valor = String(rotulo || "").toLowerCase();

      if (valor.includes("aprovado") || valor.includes("pass") || valor.includes("corrigido") || valor.includes("fechado")) return "opcao-status--sucesso";
      if (valor.includes("reprovado") || valor.includes("fail") || valor.includes("critica") || valor.includes("crítica")) return "opcao-status--erro";
      if (valor.includes("bloqueado")) return "opcao-status--bloqueado";
      if (valor.includes("pendente") || valor.includes("nao executado") || valor.includes("não executado")) return "opcao-status--pendente";
      if (valor.includes("andamento") || valor.includes("analise") || valor.includes("análise")) return "opcao-status--andamento";
      if (valor.includes("cancelado")) return "opcao-status--cancelado";
      return "";
    },

    iconePadraoOpcao(rotulo) {
      const classe = this.classeOpcao(rotulo);
      if (classe === "opcao-status--sucesso") return "check";
      if (classe === "opcao-status--erro") return "x";
      if (classe === "opcao-status--bloqueado") return "ban";
      if (classe === "opcao-status--pendente") return "clock";
      if (classe === "opcao-status--andamento") return "play";
      if (classe === "opcao-status--cancelado") return "trash-2";
      return "";
    },

    iconeMaterialPadraoOpcao(rotulo) {
      const classe = this.classeOpcao(rotulo);
      if (classe === "opcao-status--sucesso") return "check";
      if (classe === "opcao-status--erro") return "close";
      if (classe === "opcao-status--bloqueado") return "block";
      if (classe === "opcao-status--pendente") return "schedule";
      if (classe === "opcao-status--andamento") return "play_arrow";
      if (classe === "opcao-status--cancelado") return "delete";
      return "";
    },

    grupoPermiteMultiplos(campo) {
      const grupo = this.obterGrupoOpcoes(campo);
      return Boolean(grupo && grupo.selecaoMultipla);
    },

    grupoObrigatorio(campo) {
      const grupo = this.obterGrupoOpcoes(campo);
      return !grupo || grupo.obrigatorio !== false;
    },

    valorSelecionado(registro, nomeCampo, valorCampo) {
      const valorAtual = registro[nomeCampo];
      return Array.isArray(valorAtual) ? valorAtual.includes(valorCampo) : valorAtual === valorCampo;
    },

    escaparHtml(texto) {
      return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },

    aplicarMarkdownInline(texto) {
      return this.escaparHtml(texto)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
    },

    renderizarMarkdown(markdown) {
      const linhas = String(markdown || "").split("\n");
      let html = "";
      let listaAberta = false;
      let tabelaAberta = false;

      const fecharLista = () => {
        if (listaAberta) {
          html += "</ul>";
          listaAberta = false;
        }
      };

      const fecharTabela = () => {
        if (tabelaAberta) {
          html += "</tbody></table>";
          tabelaAberta = false;
        }
      };

      linhas.forEach((linha) => {
        if (linha.startsWith("|") && linha.endsWith("|")) {
          fecharLista();
          const celulas = linha.split("|").slice(1, -1).map((celula) => celula.trim());
          const linhaSeparadora = celulas.every((celula) => /^-+$/.test(celula.replaceAll(" ", "")));

          if (linhaSeparadora) {
            return;
          }

          if (!tabelaAberta) {
            html += "<table><tbody>";
            tabelaAberta = true;
          }

          html += `<tr>${celulas.map((celula) => `<td>${this.aplicarMarkdownInline(celula)}</td>`).join("")}</tr>`;
          return;
        }

        fecharTabela();

        if (linha.startsWith("# ")) {
          fecharLista();
          html += `<h1>${this.aplicarMarkdownInline(linha.slice(2))}</h1>`;
          return;
        }

        if (linha.startsWith("## ")) {
          fecharLista();
          html += `<h2>${this.aplicarMarkdownInline(linha.slice(3))}</h2>`;
          return;
        }

        if (linha.startsWith("- ")) {
          if (!listaAberta) {
            html += "<ul>";
            listaAberta = true;
          }

          html += `<li>${this.aplicarMarkdownInline(linha.slice(2))}</li>`;
          return;
        }

        if (!linha.trim()) {
          fecharLista();
          html += "<br>";
          return;
        }

        fecharLista();
        html += `<p>${this.aplicarMarkdownInline(linha)}</p>`;
      });

      fecharLista();
      fecharTabela();
      return html;
    },

    renderizarPrevia(texto, formato) {
      if (formato === "markdown" || formato === "azure") {
        return this.renderizarMarkdown(texto);
      }

      if (formato === "html") {
        return texto;
      }

      return `<pre>${this.escaparHtml(texto)}</pre>`;
    },

    obterChaveOutro(contexto, campoGrupo) {
      return `${contexto}:${campoGrupo}`;
    },

    alternarOutro(contexto, campoGrupo) {
      const chaveOutro = this.obterChaveOutro(contexto, campoGrupo);
      this.outroAtivo[chaveOutro] = !this.outroAtivo[chaveOutro];
    },

    outroEstaAtivo(contexto, campoGrupo) {
      return Boolean(this.outroAtivo[this.obterChaveOutro(contexto, campoGrupo)]);
    },

    obterValoresSelecionados(registro, nomeCampo) {
      const valorAtual = registro[nomeCampo];
      return Array.isArray(valorAtual) ? valorAtual : (valorAtual ? [valorAtual] : []);
    },

    obterValoresPersonalizados(registro, campoGrupo, nomeCampo) {
      const opcoesFixas = this.obterRotulosGrupo(campoGrupo);
      return this.obterValoresSelecionados(registro, nomeCampo).filter((valor) => !opcoesFixas.includes(valor));
    },

    obterRegistroPorContexto(contexto) {
      if (contexto === "bug") return this.bug;
      if (contexto === "execucao") return this.execucao;
      return this.documentacao;
    },

    formatarTamanhoArquivo(tamanhoBytes) {
      if (tamanhoBytes >= 1024 * 1024) {
        return `${(tamanhoBytes / 1024 / 1024).toFixed(1)} MB`;
      }

      return `${(tamanhoBytes / 1024).toFixed(1)} KB`;
    },

    criarPartesArquivo(arquivo) {
      const partes = [];
      let inicioParte = 0;
      let numeroParte = 1;

      while (inicioParte < arquivo.size) {
        const fimParte = Math.min(inicioParte + this.limiteParteBytes, arquivo.size);
        const blobParte = arquivo.slice(inicioParte, fimParte, arquivo.type);
        partes.push({
          identificador: crypto.randomUUID(),
          nome: `${arquivo.name}.parte-${numeroParte}`,
          tamanho: blobParte.size,
          url: URL.createObjectURL(blobParte)
        });
        inicioParte = fimParte;
        numeroParte += 1;
      }

      return partes;
    },

    adicionarEvidencias(contexto, arquivos) {
      const listaArquivos = Array.from(arquivos || []);
      const registro = this.obterRegistroPorContexto(contexto);

      listaArquivos.forEach((arquivo) => {
        const evidencia = {
          identificador: crypto.randomUUID(),
          nome: arquivo.name,
          tipo: arquivo.type || "application/octet-stream",
          tamanho: arquivo.size,
          arquivo,
          url: URL.createObjectURL(arquivo),
          video: arquivo.type.startsWith("video/"),
          audio: arquivo.type.startsWith("audio/"),
          imagem: arquivo.type.startsWith("image/"),
          gif: arquivo.type === "image/gif",
          pdf: arquivo.type === "application/pdf",
          grande: arquivo.size > this.limiteMidiaHtmlBytes,
          partes: arquivo.size > this.limiteParteBytes ? this.criarPartesArquivo(arquivo) : []
        };
        this.evidenciaArquivos[contexto].push(evidencia);
      });

      const nomesArquivos = listaArquivos.map((arquivo) => arquivo.name).join(", ");
      registro.evidencias = [registro.evidencias, nomesArquivos].filter(Boolean).join("\n");
      this.registrarHistorico("criacao", "evidencia", `${listaArquivos.length} evidencia(s) adicionada(s) em ${contexto}`);
      this.exibirToast("Evidencias adicionadas.");
      this.atualizarIcones();
    },

    selecionarEvidencias(contexto, evento) {
      this.adicionarEvidencias(contexto, evento.target.files);
      evento.target.value = "";
    },

    soltarEvidencias(contexto, evento) {
      this.adicionarEvidencias(contexto, evento.dataTransfer.files);
    },

    removerEvidencia(contexto, identificador) {
      const evidencia = this.evidenciaArquivos[contexto].find((arquivo) => arquivo.identificador === identificador);

      if (evidencia) {
        URL.revokeObjectURL(evidencia.url);
        evidencia.partes.forEach((parte) => URL.revokeObjectURL(parte.url));
      }

      this.evidenciaArquivos[contexto] = this.evidenciaArquivos[contexto].filter((arquivo) => arquivo.identificador !== identificador);
      this.registrarHistorico("exclusao", "evidencia", `Evidencia removida de ${contexto}`);
    },

    contextoPossuiMidia(contexto) {
      return this.evidenciaArquivos[contexto].some((evidencia) => evidencia.video || evidencia.gif);
    },

    async arquivoParaDataUrl(arquivo) {
      return new Promise((resolver, rejeitar) => {
        const leitorArquivo = new FileReader();
        leitorArquivo.onload = () => resolver(leitorArquivo.result);
        leitorArquivo.onerror = () => rejeitar(leitorArquivo.error);
        leitorArquivo.readAsDataURL(arquivo);
      });
    },

    baixarPartesGrandes(contexto) {
      this.evidenciaArquivos[contexto]
        .filter((evidencia) => evidencia.grande)
        .flatMap((evidencia) => evidencia.partes)
        .forEach((parte) => {
          const linkDownload = document.createElement("a");
          linkDownload.href = parte.url;
          linkDownload.download = parte.nome;
          linkDownload.click();
        });
    },

    async exportarHtmlComEvidencias(tipoDocumento) {
      const contexto = tipoDocumento === "bug" ? "bug" : tipoDocumento === "execucao" ? "execucao" : "documentacao";
      const titulo = tipoDocumento === "bug" ? "Bug Report" : tipoDocumento === "execucao" ? "Execucao de Teste" : "Plano de Testes";
      const evidencias = await Promise.all(this.evidenciaArquivos[contexto].map(async (evidencia) => {
        const podeEmbutir = !evidencia.grande;
        const origem = podeEmbutir ? await this.arquivoParaDataUrl(evidencia.arquivo) : evidencia.url;
        return { ...evidencia, origem, podeEmbutir };
      }));
      const corpo = evidencias.map((evidencia) => {
        const detalhes = `<p>${this.escaparHtml(evidencia.nome)} - ${this.formatarTamanhoArquivo(evidencia.tamanho)}</p>`;
        const downloads = evidencia.partes.map((parte) => `<a href="${parte.url}" download="${this.escaparHtml(parte.nome)}">${this.escaparHtml(parte.nome)} (${this.formatarTamanhoArquivo(parte.tamanho)})</a>`).join("");

        if (evidencia.video && !evidencia.grande) return `<section><h2>Video</h2>${detalhes}<video controls src="${evidencia.origem}"></video></section>`;
        if (evidencia.gif || evidencia.imagem) return `<section><h2>Imagem / GIF</h2>${detalhes}<img src="${evidencia.origem}" alt="${this.escaparHtml(evidencia.nome)}"></section>`;
        if (evidencia.audio && !evidencia.grande) return `<section><h2>Audio</h2>${detalhes}<audio controls src="${evidencia.origem}"></audio></section>`;
        return `<section><h2>Arquivo</h2>${detalhes}<a href="${evidencia.url}" download="${this.escaparHtml(evidencia.nome)}">Baixar arquivo</a><div class="partes">${downloads}</div></section>`;
      }).join("");

      const html = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${titulo}</title><style>
        body{font-family:Arial,sans-serif;background:#f5f7fb;color:#172033;margin:0;padding:32px}
        main{max-width:980px;margin:auto;display:grid;gap:18px}
        header,section{background:#fff;border:1px solid #d9e1ee;border-radius:14px;padding:22px;box-shadow:0 12px 30px rgba(15,23,42,.08)}
        header{background:linear-gradient(135deg,#172033,#2563eb);color:#fff}
        h1,h2{margin-top:0} video,img{width:100%;max-height:70vh;border-radius:12px;background:#000} audio{width:100%}
        a{display:inline-flex;margin:6px 8px 0 0;color:#2563eb;font-weight:700}
      </style></head><body><main><header><h1>${titulo}</h1><p>Relatorio HTML interativo com evidencias executaveis.</p></header>${corpo || "<section><p>Nenhuma evidencia anexada.</p></section>"}</main></body></html>`;

      this.baixarArquivo(`${titulo.toLowerCase().replaceAll(" ", "-")}-evidencias.html`, html, "text/html");
      this.baixarPartesGrandes(contexto);
      this.registrarHistorico("exportacao", "html", `HTML com evidencias exportado: ${contexto}`);
    },

    aplicarValorPersonalizado(registro, contexto, campoGrupo, nomeCampo, destino) {
      const valorCampo = (this.opcaoPersonalizada[destino] || "").trim();

      if (!valorCampo) {
        this.exibirToast("Informe uma opcao para adicionar.");
        return;
      }

      if (this.grupoPermiteMultiplos(campoGrupo)) {
        const valoresAtuais = this.obterValoresSelecionados(registro, nomeCampo);

        if (!valoresAtuais.includes(valorCampo)) {
          valoresAtuais.push(valorCampo);
        }

        registro[nomeCampo] = valoresAtuais;
      } else {
        registro[nomeCampo] = valorCampo;
        this.outroAtivo[this.obterChaveOutro(contexto, campoGrupo)] = false;
      }

      if (contexto === "documentacao" && nomeCampo === "tiposTeste") {
        this.sincronizarTiposTeste();
      }

      this.opcaoPersonalizada[destino] = "";
      this.gerarDocumentacaoFinal(false);
      this.atualizarIcones();
    },

    removerValorPersonalizado(registro, campoGrupo, nomeCampo, valorCampo) {
      if (this.grupoPermiteMultiplos(campoGrupo)) {
        const valoresAtualizados = this.obterValoresSelecionados(registro, nomeCampo).filter((valor) => valor !== valorCampo);

        if (valoresAtualizados.length === 0 && this.grupoObrigatorio(campoGrupo)) {
          const primeiraOpcao = this.obterRotulosGrupo(campoGrupo)[0];
          registro[nomeCampo] = primeiraOpcao ? [primeiraOpcao] : [];
        } else {
          registro[nomeCampo] = valoresAtualizados;
        }
      } else if (registro[nomeCampo] === valorCampo) {
        registro[nomeCampo] = this.grupoObrigatorio(campoGrupo) ? (this.obterRotulosGrupo(campoGrupo)[0] || "") : "";
      }

      if (nomeCampo === "tiposTeste") {
        this.sincronizarTiposTeste();
      }

      this.gerarDocumentacaoFinal(false);
      this.atualizarIcones();
    },

    registrarHistorico(acao, tipoRegistro, descricao, detalhes = {}) {
      const registroHistorico = {
        identificador: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
        acao,
        tipoRegistro,
        descricao,
        detalhes
      };

      this.historicoLocal.unshift(registroHistorico);
      this.historicoLocal = this.historicoLocal.slice(0, 300);
      window.armazenamentoLocal.salvar("historico", this.historicoLocal);
    },

    obterColecaoCadastro(tipoCadastro) {
      const mapaColecoes = {
        qa: "qas",
        desenvolvedor: "desenvolvedores",
        clienteProjeto: "clientesProjetos"
      };
      return mapaColecoes[tipoCadastro];
    },

    obterFormularioCadastro(tipoCadastro) {
      const mapaFormularios = {
        qa: "novoQa",
        desenvolvedor: "novoDesenvolvedor",
        clienteProjeto: "novoClienteProjeto"
      };
      return mapaFormularios[tipoCadastro];
    },

    obterCadastroPorId(tipoCadastro, identificador) {
      const nomeColecao = this.obterColecaoCadastro(tipoCadastro);
      return this.configuracoes[nomeColecao]?.find((cadastro) => cadastro.identificador === identificador) || null;
    },

    obterCadastroSelecionado(contexto, tipoCadastro) {
      const registro = this.obterRegistroPorContexto(contexto);
      const campo = tipoCadastro === "desenvolvedor" ? "desenvolvedorId" : tipoCadastro === "clienteProjeto" ? "clienteProjetoId" : "qaResponsavelId";
      return this.obterCadastroPorId(tipoCadastro, registro[campo]);
    },

    obterImagemCadastro(cadastro) {
      return cadastro?.imagemPerfil || "";
    },

    obterIniciaisCadastro(cadastro) {
      const nome = cadastro?.nome || "?";
      return nome.split(" ").filter(Boolean).slice(0, 2).map((parteNome) => parteNome[0]).join("").toUpperCase();
    },

    async selecionarImagemCadastro(evento, cadastro) {
      const arquivo = evento.target.files[0];

      if (!arquivo) {
        return;
      }

      cadastro.imagemPerfil = await this.arquivoParaDataUrl(arquivo);
      evento.target.value = "";
      this.exibirToast("Imagem adicionada.");
    },

    criarCadastroPerfil(tipoCadastro) {
      const nomeFormulario = this.obterFormularioCadastro(tipoCadastro);
      const nomeColecao = this.obterColecaoCadastro(tipoCadastro);
      const formulario = this[nomeFormulario];
      const nome = formulario.nome.trim();

      if (!nome) {
        this.exibirToast("Informe o nome do cadastro.");
        return;
      }

      this.configuracoes[nomeColecao].push({
        identificador: crypto.randomUUID(),
        nome,
        ocupacao: formulario.ocupacao.trim() || "Profissional",
        imagemPerfil: formulario.imagemPerfil || ""
      });

      this[nomeFormulario] = tipoCadastro === "qa"
        ? { nome: "", ocupacao: "QA Engineer", imagemPerfil: "" }
        : tipoCadastro === "desenvolvedor"
          ? { nome: "", ocupacao: "Desenvolvedor", imagemPerfil: "" }
          : { nome: "", ocupacao: "Cliente / Projeto", imagemPerfil: "" };

      this.salvarConfiguracoes();
      this.registrarHistorico("criacao", tipoCadastro, `Cadastro criado: ${nome}`);
    },

    excluirCadastroPerfil(tipoCadastro, identificador) {
      const nomeColecao = this.obterColecaoCadastro(tipoCadastro);
      this.configuracoes[nomeColecao] = this.configuracoes[nomeColecao].filter((cadastro) => cadastro.identificador !== identificador);

      ["documentacao", "execucao", "bug"].forEach((contexto) => {
        const registro = this.obterRegistroPorContexto(contexto);
        if (registro.qaResponsavelId === identificador) registro.qaResponsavelId = "";
        if (registro.desenvolvedorId === identificador) registro.desenvolvedorId = "";
        if (registro.clienteProjetoId === identificador) registro.clienteProjetoId = "";
      });

      this.salvarConfiguracoes();
      this.registrarHistorico("exclusao", tipoCadastro, "Cadastro removido", { identificador });
    },

    selecionarQaFormulario(contexto, identificador) {
      const registro = this.obterRegistroPorContexto(contexto);
      const qaSelecionado = this.obterCadastroPorId("qa", identificador);
      registro.qaResponsavelId = identificador;

      if (contexto === "execucao" && qaSelecionado) {
        registro.executor = qaSelecionado.nome;
      }

      this.gerarDocumentacaoFinal(false);
    },

    selecionarDesenvolvedorFormulario(contexto, identificador) {
      this.obterRegistroPorContexto(contexto).desenvolvedorId = identificador;
      this.gerarDocumentacaoFinal(false);
    },

    selecionarClienteProjetoFormulario(contexto, identificador) {
      const registro = this.obterRegistroPorContexto(contexto);
      const clienteProjeto = this.obterCadastroPorId("clienteProjeto", identificador);
      registro.clienteProjetoId = identificador;

      if (clienteProjeto && !registro.projeto) {
        registro.projeto = clienteProjeto.nome;
      }

      this.gerarDocumentacaoFinal(false);
    },

    montarPerfisSelecionados(contexto) {
      return {
        qa: this.obterCadastroSelecionado(contexto, "qa"),
        desenvolvedor: this.obterCadastroSelecionado(contexto, "desenvolvedor"),
        clienteProjeto: this.obterCadastroSelecionado(contexto, "clienteProjeto")
      };
    },

    textoPerfisSelecionados(contexto) {
      const perfis = this.montarPerfisSelecionados(contexto);
      return [
        perfis.clienteProjeto ? `Cliente/Projeto: ${perfis.clienteProjeto.nome} (${perfis.clienteProjeto.ocupacao})` : "",
        perfis.qa ? `Criador/Executor: ${perfis.qa.nome} (${perfis.qa.ocupacao})` : "",
        perfis.desenvolvedor ? `Desenvolvedor: ${perfis.desenvolvedor.nome} (${perfis.desenvolvedor.ocupacao})` : ""
      ].filter(Boolean).join("\n");
    },

    normalizarDocumentacao() {
      if (!Array.isArray(this.documentacao.tiposTeste)) {
        this.documentacao.tiposTeste = this.documentacao.tipoTeste ? [this.documentacao.tipoTeste] : ["Funcional"];
      }

      this.sincronizarTiposTeste();
    },

    normalizarSelecaoPorGrupo(registro, campoGrupo, nomeCampo) {
      if (this.grupoPermiteMultiplos(campoGrupo)) {
        registro[nomeCampo] = this.obterValoresSelecionados(registro, nomeCampo);
      } else if (Array.isArray(registro[nomeCampo])) {
        registro[nomeCampo] = registro[nomeCampo][0] || "";
      }
    },

    sincronizarTiposTeste() {
      this.documentacao.tipoTeste = this.documentacao.tiposTeste.join(", ");
    },

    selecionarCampoDocumentacao(nomeCampo, valorCampo) {
      this.documentacao[nomeCampo] = valorCampo;
      this.gerarDocumentacaoFinal(false);
    },

    selecionarOpcaoDocumentacao(campoGrupo, nomeCampo, valorCampo) {
      this.normalizarSelecaoPorGrupo(this.documentacao, campoGrupo, nomeCampo);

      if (this.grupoPermiteMultiplos(campoGrupo)) {
        const valoresAtuais = this.obterValoresSelecionados(this.documentacao, nomeCampo);
        const indiceValor = valoresAtuais.indexOf(valorCampo);

        if (indiceValor >= 0) {
          if (valoresAtuais.length === 1 && this.grupoObrigatorio(campoGrupo)) {
            this.exibirToast("Mantenha ao menos uma opcao selecionada.");
            return;
          }

          valoresAtuais.splice(indiceValor, 1);
        } else {
          valoresAtuais.push(valorCampo);
        }

        this.documentacao[nomeCampo] = valoresAtuais;
        this.sincronizarTiposTeste();
      } else {
        this.documentacao[nomeCampo] = valorCampo;
      }

      this.gerarDocumentacaoFinal(false);
    },

    adicionarOpcaoDocumentacao(nomeCampo, nomeLista) {
      const valorCampo = this.opcaoPersonalizada[nomeCampo].trim();

      if (!valorCampo) {
        this.exibirToast("Informe a opcao personalizada.");
        return;
      }

      if (!this[nomeLista].includes(valorCampo)) {
        this[nomeLista].push(valorCampo);
      }

      this.documentacao[nomeCampo] = valorCampo;
      this.opcaoPersonalizada[nomeCampo] = "";
      this.gerarDocumentacaoFinal(false);
      this.exibirToast("Opcao personalizada aplicada.");
    },

    adicionarOpcaoGrupoConfigurado(campoGrupo, nomeCampo, destino) {
      this.aplicarValorPersonalizado(this.documentacao, "documentacao", campoGrupo, nomeCampo, destino);
    },

    alternarTipoTeste(tipoTeste) {
      this.selecionarOpcaoDocumentacao("tiposTeste", "tiposTeste", tipoTeste);
    },

    adicionarTipoTestePersonalizado() {
      this.adicionarOpcaoGrupoConfigurado("tiposTeste", "tiposTeste", "tipoTeste");
    },

    registrarServiceWorker() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("serviceWorker.js").catch(() => {
          this.exibirToast("Service worker indisponivel neste navegador.");
        });
      }
    },

    salvarConfiguracoes() {
      this.configuracoes = window.configuracoesQa.normalizarConfiguracoes(this.configuracoes);
      this.sincronizarOpcoesConfiguradas();
      window.armazenamentoLocal.salvar("configuracoes", this.configuracoes);
      this.registrarHistorico("edicao", "configuracoes", "Configuracoes atualizadas");
      this.exibirToast("Configuracoes salvas.");
    },

    grupoConfiguracaoAberto(campo) {
      return Boolean(this.acordeonsGrupos[campo]);
    },

    alternarGrupoConfiguracao(campo) {
      this.acordeonsGrupos[campo] = !this.acordeonsGrupos[campo];
      this.atualizarIcones();
    },

    alternarTema() {
      this.configuracoes.tema = this.configuracoes.tema === "escuro" ? "claro" : "escuro";
      this.salvarConfiguracoes();
    },

    adicionarPassoDocumentacao() {
      this.documentacao.passos.push(window.documentacaoTeste.criarPasso());
      this.atualizarIcones();
    },

    removerPassoDocumentacao(indice) {
      if (this.documentacao.passos.length === 1) {
        this.exibirToast("Mantenha pelo menos um passo.");
        return;
      }

      this.documentacao.passos.splice(indice, 1);
    },

    iniciarArrastePasso(indice) {
      this.passoArrastadoIndice = indice;
    },

    soltarPasso(indiceDestino) {
      if (this.passoArrastadoIndice === null || this.passoArrastadoIndice === indiceDestino) {
        this.passoArrastadoIndice = null;
        return;
      }

      const passosAtualizados = [...this.documentacao.passos];
      const passoMovido = passosAtualizados.splice(this.passoArrastadoIndice, 1)[0];
      passosAtualizados.splice(indiceDestino, 0, passoMovido);
      this.documentacao.passos = passosAtualizados;
      this.passoArrastadoIndice = null;
      this.gerarDocumentacaoFinal(false);
    },

    gerarDocumentacaoFinal(exibirMensagem = true) {
      const textoBase = window.documentacaoTeste.gerarTexto(this.documentacao, this.configuracoes, this.formatoSaida);
      const campos = this.textoCamposPersonalizados("documentacao");
      const perfis = this.textoPerfisSelecionados("documentacao");
      this.textoDocumentacaoFinal = [textoBase, perfis ? `\nPerfis envolvidos\n${perfis}` : "", campos ? `\nCampos personalizados\n${campos}` : ""].filter(Boolean).join("\n");

      if (exibirMensagem) {
        const documentoSalvo = { ...this.documentacao, identificador: this.documentacao.identificador || crypto.randomUUID(), atualizadoEm: new Date().toISOString() };
        const indiceExistente = this.documentacoesCriadas.findIndex((documento) => documento.identificador === documentoSalvo.identificador);

        if (indiceExistente >= 0) {
          this.documentacoesCriadas.splice(indiceExistente, 1, documentoSalvo);
        } else {
          this.documentacoesCriadas.push(documentoSalvo);
        }

        window.armazenamentoLocal.salvar("documentacoes", this.documentacoesCriadas);
        this.registrarHistorico(indiceExistente >= 0 ? "edicao" : "criacao", "documentacao", `Documentacao salva: ${documentoSalvo.funcionalidade || documentoSalvo.projeto || "sem titulo"}`, { identificador: documentoSalvo.identificador });
        this.exibirToast("Documentacao gerada e salva.");
      }
    },

    abrirDocumentacao(documento) {
      this.documentacao = JSON.parse(JSON.stringify(documento));
      this.normalizarDocumentacao();
      this.gerarDocumentacaoFinal(false);
      this.trocarTela("documentacao");
    },

    limparFormularioDocumentacao() {
      this.documentacao = window.documentacaoTeste.criarDocumentacao(this.configuracoes);
      this.gerarDocumentacaoFinal(false);
      this.registrarHistorico("edicao", "documentacao", "Formulario de documentacao limpo");
      this.exibirToast("Formulario limpo.");
    },

    duplicarDocumentacao() {
      this.documentacao = {
        ...JSON.parse(JSON.stringify(this.documentacao)),
        identificador: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
        funcionalidade: `${this.documentacao.funcionalidade || "Caso de teste"} - copia`
      };
      this.gerarDocumentacaoFinal(false);
      this.exibirToast("Caso de teste duplicado.");
    },

    salvarRascunho() {
      window.armazenamentoLocal.salvar("rascunhoDocumentacao", this.documentacao);
      window.armazenamentoLocal.salvar("rascunhoExecucao", this.execucao);
      window.armazenamentoLocal.salvar("rascunhoBug", this.bug);
      this.exibirToast("Rascunho salvo.");
    },

    restaurarRascunho() {
      this.documentacao = window.armazenamentoLocal.buscar("rascunhoDocumentacao", window.documentacaoTeste.criarDocumentacao(this.configuracoes));
      this.normalizarDocumentacao();
      this.gerarDocumentacaoFinal(false);
      this.exibirToast("Rascunho restaurado.");
    },

    registrarExecucao() {
      const execucaoSalva = { ...this.execucao, identificador: crypto.randomUUID(), criadoEm: new Date().toISOString() };
      this.execucoesRegistradas.push(execucaoSalva);
      window.armazenamentoLocal.salvar("execucoes", this.execucoesRegistradas);
      this.registrarHistorico("criacao", "execucao", `Execucao registrada: ${execucaoSalva.status}`, { identificador: execucaoSalva.identificador });
      this.execucao = window.execucaoTeste.criarExecucao(this.configuracoes);
      this.exibirToast("Execucao registrada.");
    },

    selecionarCampoExecucao(nomeCampo, valorCampo) {
      this.execucao[nomeCampo] = valorCampo;
    },

    selecionarOpcaoExecucao(campoGrupo, nomeCampo, valorCampo) {
      this.normalizarSelecaoPorGrupo(this.execucao, campoGrupo, nomeCampo);

      if (this.grupoPermiteMultiplos(campoGrupo)) {
        const valoresAtuais = this.obterValoresSelecionados(this.execucao, nomeCampo);
        const indiceValor = valoresAtuais.indexOf(valorCampo);

        if (indiceValor >= 0) {
          if (valoresAtuais.length === 1 && this.grupoObrigatorio(campoGrupo)) {
            this.exibirToast("Mantenha ao menos uma opcao selecionada.");
            return;
          }

          valoresAtuais.splice(indiceValor, 1);
        } else {
          valoresAtuais.push(valorCampo);
        }

        this.execucao[nomeCampo] = valoresAtuais;
      } else {
        this.execucao[nomeCampo] = valorCampo;
      }
    },

    adicionarOpcaoExecucao(nomeCampo, nomeLista) {
      this.aplicarValorPersonalizado(this.execucao, "execucao", nomeCampo, nomeCampo, nomeCampo);
    },

    selecionarCampoBug(nomeCampo, valorCampo) {
      this.bug[nomeCampo] = valorCampo;
    },

    selecionarOpcaoBug(campoGrupo, nomeCampo, valorCampo) {
      this.normalizarSelecaoPorGrupo(this.bug, campoGrupo, nomeCampo);

      if (this.grupoPermiteMultiplos(campoGrupo)) {
        const valoresAtuais = this.obterValoresSelecionados(this.bug, nomeCampo);
        const indiceValor = valoresAtuais.indexOf(valorCampo);

        if (indiceValor >= 0) {
          if (valoresAtuais.length === 1 && this.grupoObrigatorio(campoGrupo)) {
            this.exibirToast("Mantenha ao menos uma opcao selecionada.");
            return;
          }

          valoresAtuais.splice(indiceValor, 1);
        } else {
          valoresAtuais.push(valorCampo);
        }

        this.bug[nomeCampo] = valoresAtuais;
      } else {
        this.bug[nomeCampo] = valorCampo;
      }
    },

    adicionarOpcaoBug(nomeCampo, nomeLista) {
      this.aplicarValorPersonalizado(this.bug, "bug", nomeCampo, nomeCampo, nomeCampo);
    },

    registrarBug() {
      const bugSalvo = { ...this.bug, identificador: this.bug.identificador || crypto.randomUUID(), criadoEm: new Date().toISOString() };
      const indiceExistente = this.bugsReportados.findIndex((bugRegistrado) => bugRegistrado.identificador === bugSalvo.identificador);

      if (indiceExistente >= 0) {
        this.bugsReportados.splice(indiceExistente, 1, bugSalvo);
      } else {
        this.bugsReportados.push(bugSalvo);
      }

      window.armazenamentoLocal.salvar("bugs", this.bugsReportados);
      this.registrarHistorico(indiceExistente >= 0 ? "edicao" : "criacao", "bug", `Bug report salvo: ${bugSalvo.titulo || "sem titulo"}`, { identificador: bugSalvo.identificador });
      this.exibirToast("Bug report salvo.");
    },

    salvarSnippet() {
      if (!this.snippetEdicao.titulo.trim()) {
        this.exibirToast("Informe um titulo para o snippet.");
        return;
      }

      const snippetSalvo = { ...this.snippetEdicao, identificador: this.snippetEdicao.identificador || crypto.randomUUID() };
      const indiceExistente = this.snippets.findIndex((snippet) => snippet.identificador === snippetSalvo.identificador);

      if (indiceExistente >= 0) {
        this.snippets.splice(indiceExistente, 1, snippetSalvo);
      } else {
        this.snippets.push(snippetSalvo);
      }

      window.armazenamentoLocal.salvar("snippets", this.snippets);
      this.registrarHistorico(indiceExistente >= 0 ? "edicao" : "criacao", "snippet", `Snippet salvo: ${snippetSalvo.titulo}`, { identificador: snippetSalvo.identificador });
      this.snippetEdicao = window.snippetsQa.criarSnippet();
      this.exibirToast("Snippet salvo.");
    },

    editarSnippet(snippet) {
      this.snippetEdicao = { ...snippet };
    },

    excluirSnippet(identificador) {
      this.snippets = this.snippets.filter((snippet) => snippet.identificador !== identificador);
      window.armazenamentoLocal.salvar("snippets", this.snippets);
      this.registrarHistorico("exclusao", "snippet", "Snippet excluido", { identificador });
      this.exibirToast("Snippet excluido.");
    },

    salvarTermoGlossario() {
      if (!this.termoGlossarioEdicao.nome.trim()) {
        this.exibirToast("Informe o nome do termo.");
        return;
      }

      const termoSalvo = { ...this.termoGlossarioEdicao, identificador: this.termoGlossarioEdicao.identificador || crypto.randomUUID() };
      const indiceExistente = this.glossario.findIndex((termo) => termo.identificador === termoSalvo.identificador);

      if (indiceExistente >= 0) {
        this.glossario.splice(indiceExistente, 1, termoSalvo);
      } else {
        this.glossario.push(termoSalvo);
      }

      window.armazenamentoLocal.salvar("glossario", this.glossario);
      this.registrarHistorico(indiceExistente >= 0 ? "edicao" : "criacao", "glossario", `Termo salvo: ${termoSalvo.nome}`, { identificador: termoSalvo.identificador });
      this.termoGlossarioEdicao = window.glossarioQa.criarTermo();
      this.exibirToast("Termo salvo.");
    },

    editarTermoGlossario(termo) {
      this.termoGlossarioEdicao = { ...termo };
    },

    excluirTermoGlossario(identificador) {
      this.glossario = this.glossario.filter((termo) => termo.identificador !== identificador);
      window.armazenamentoLocal.salvar("glossario", this.glossario);
      this.registrarHistorico("exclusao", "glossario", "Termo excluido", { identificador });
      this.exibirToast("Termo excluido.");
    },

    adicionarOpcaoConfiguracao(grupo) {
      const valorOpcao = (this.novaOpcaoGrupo[grupo.campo] || "").trim();

      if (!valorOpcao) {
        this.exibirToast("Informe o nome da opcao.");
        return;
      }

      grupo.opcoes.push({ identificador: crypto.randomUUID(), rotulo: valorOpcao, icone: "", imagem: "" });
      this.novaOpcaoGrupo[grupo.campo] = "";
      this.salvarConfiguracoes();
    },

    criarGrupoOpcoesPersonalizado() {
      const nome = this.novoGrupoOpcao.nome.trim();
      const campo = (this.novoGrupoOpcao.campo.trim() || nome).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

      if (!nome || !campo) {
        this.exibirToast("Informe nome e chave do grupo.");
        return;
      }

      if (this.obterGrupoOpcoes(campo)) {
        this.exibirToast("Ja existe um grupo com essa chave.");
        return;
      }

      this.configuracoes.gruposOpcoes.push({
        identificador: crypto.randomUUID(),
        nome,
        campo,
        selecaoMultipla: this.novoGrupoOpcao.selecaoMultipla,
        obrigatorio: this.novoGrupoOpcao.obrigatorio,
        opcoes: [{ identificador: crypto.randomUUID(), rotulo: "Padrao", icone: "", imagem: "" }]
      });
      this.acordeonsGrupos[campo] = true;
      this.novoGrupoOpcao = { nome: "", campo: "", selecaoMultipla: false, obrigatorio: true };
      this.salvarConfiguracoes();
    },

    excluirGrupoOpcoesPersonalizado(campo) {
      const gruposBase = ["canal", "ambiente", "prioridade", "tiposTeste", "statusTeste", "statusBug", "severidade", "dispositivo", "navegador"];
      if (gruposBase.includes(campo)) {
        this.exibirToast("Grupo padrao nao pode ser excluido.");
        return;
      }

      this.configuracoes.gruposOpcoes = this.configuracoes.gruposOpcoes.filter((grupo) => grupo.campo !== campo);
      this.salvarConfiguracoes();
    },

    criarCampoPersonalizado() {
      const nome = this.novoCampoPersonalizado.nome.trim();
      const chave = (this.novoCampoPersonalizado.chave.trim() || nome).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

      if (!nome || !chave) {
        this.exibirToast("Informe nome e chave do campo.");
        return;
      }

      this.configuracoes.camposPersonalizados.push({
        ...this.novoCampoPersonalizado,
        identificador: crypto.randomUUID(),
        nome,
        chave
      });
      this.novoCampoPersonalizado = { nome: "", chave: "", tipo: "texto", destino: "todos", grupoCampo: "", obrigatorio: false };
      this.salvarConfiguracoes();
    },

    excluirCampoPersonalizado(identificador) {
      this.configuracoes.camposPersonalizados = this.configuracoes.camposPersonalizados.filter((campo) => campo.identificador !== identificador);
      this.salvarConfiguracoes();
    },

    selecionarCampoPersonalizado(contexto, campo, valor) {
      if (!this.camposPersonalizadosValores[contexto]) this.camposPersonalizadosValores[contexto] = {};
      if (campo.tipo === "botoes" && this.grupoPermiteMultiplos(campo.grupoCampo)) {
        const valores = Array.isArray(this.camposPersonalizadosValores[contexto][campo.chave]) ? this.camposPersonalizadosValores[contexto][campo.chave] : [];
        const indice = valores.indexOf(valor);
        if (indice >= 0) valores.splice(indice, 1);
        else valores.push(valor);
        this.camposPersonalizadosValores[contexto][campo.chave] = valores;
      } else {
        this.camposPersonalizadosValores[contexto][campo.chave] = valor;
      }
    },

    campoPersonalizadoSelecionado(contexto, campo, valor) {
      const valorAtual = this.camposPersonalizadosValores[contexto]?.[campo.chave];
      return Array.isArray(valorAtual) ? valorAtual.includes(valor) : valorAtual === valor;
    },

    textoCamposPersonalizados(contexto) {
      return this.obterCamposFormulario(contexto)
        .map((campo) => {
          const valor = this.camposPersonalizadosValores[contexto]?.[campo.chave];
          const textoValor = Array.isArray(valor) ? valor.join(", ") : valor;
          return textoValor ? `${campo.nome}: ${textoValor}` : "";
        })
        .filter(Boolean)
        .join("\n");
    },

    excluirOpcaoConfiguracao(grupo, indiceOpcao) {
      if (grupo.opcoes.length === 1 && grupo.obrigatorio) {
        this.exibirToast("Este grupo precisa manter ao menos uma opcao.");
        return;
      }

      const opcaoRemovida = grupo.opcoes.splice(indiceOpcao, 1)[0];
      this.salvarConfiguracoes();
      this.registrarHistorico("exclusao", "configuracoes", `Opcao removida: ${opcaoRemovida.rotulo}`);
    },

    baixarArquivo(nomeArquivo, conteudo, tipoArquivo = "application/json") {
      const arquivo = new Blob([conteudo], { type: tipoArquivo });
      const enderecoArquivo = URL.createObjectURL(arquivo);
      const linkDownload = document.createElement("a");
      linkDownload.href = enderecoArquivo;
      linkDownload.download = nomeArquivo;
      linkDownload.click();
      URL.revokeObjectURL(enderecoArquivo);
    },

    baixarTemplate(formato) {
      const conteudo = formato === "json"
        ? window.importadorDados.gerarJsonTemplate(this.tipoTemplateSelecionado)
        : window.importadorDados.gerarCsvTemplate(this.tipoTemplateSelecionado);
      const tipoArquivo = formato === "json" ? "application/json" : "text/csv";
      this.baixarArquivo(`template-${this.tipoTemplateSelecionado}.${formato}`, conteudo, tipoArquivo);
      this.registrarHistorico("exportacao", "template", `Template ${formato.toUpperCase()} baixado: ${this.tipoTemplateSelecionado}`);
    },

    selecionarArquivoImportacao(evento) {
      this.arquivoImportacao = evento.target.files[0];
      this.errosImportacao = [];
    },

    receberArquivoSolto(evento) {
      this.arquivoImportacao = evento.dataTransfer.files[0];
      this.errosImportacao = [];
    },

    async importarDadosSelecionados() {
      if (!this.arquivoImportacao) {
        this.exibirToast("Selecione um arquivo CSV ou JSON.");
        return;
      }

      try {
        const resultado = await window.importadorDados.lerArquivo(this.arquivoImportacao, this.tipoTemplateSelecionado);
        this.errosImportacao = resultado.erros;

        if (this.errosImportacao.length > 0) {
          this.exibirToast("Arquivo possui erros de validacao.");
          return;
        }

        const mapaColecoes = {
          documentacoes: "documentacoesCriadas",
          execucoes: "execucoesRegistradas",
          bugs: "bugsReportados",
          snippets: "snippets",
          glossario: "glossario"
        };
        const mapaChaves = {
          documentacoes: "documentacoes",
          execucoes: "execucoes",
          bugs: "bugs",
          snippets: "snippets",
          glossario: "glossario"
        };
        const nomeColecao = mapaColecoes[this.tipoTemplateSelecionado];

        this[nomeColecao] = [...this[nomeColecao], ...resultado.registros];
        window.armazenamentoLocal.salvar(mapaChaves[this.tipoTemplateSelecionado], this[nomeColecao]);
        this.registrarHistorico("importacao", this.tipoTemplateSelecionado, `${resultado.registros.length} registro(s) importado(s) de ${this.arquivoImportacao.name}`);
        this.exibirToast("Importacao concluida.");
      } catch (erro) {
        this.errosImportacao = [`Arquivo invalido: ${erro.message}`];
        this.exibirToast("Nao foi possivel importar o arquivo.");
      }
    },

    async copiarTexto(texto) {
      if (!texto) {
        this.exibirToast("Nada para copiar.");
        return;
      }

      await navigator.clipboard.writeText(texto);
      this.exibirToast("Texto copiado.");
    },

    montarDadosExportacao(tipoDocumento) {
      const contexto = tipoDocumento === "bug" ? "bug" : tipoDocumento === "execucao" ? "execucao" : "documentacao";
      const titulo = tipoDocumento === "bug" ? "Bug Report" : tipoDocumento === "execucao" ? "Execucao de Teste" : "Plano de Testes";
      const subtitulo = tipoDocumento === "bug" ? this.bug.titulo || "Defeito registrado" : tipoDocumento === "execucao" ? this.execucao.casoTeste || "Registro de execucao" : this.documentacao.funcionalidade || "Planejamento de teste";
      const dadosOriginais = tipoDocumento === "bug" ? this.bug : tipoDocumento === "execucao" ? this.execucao : this.documentacao;
      const perfisSelecionados = this.montarPerfisSelecionados(contexto);
      const dados = { ...dadosOriginais, camposPersonalizados: this.textoCamposPersonalizados(contexto), perfisSelecionados };
      const resumo = tipoDocumento === "bug"
        ? {
          Projeto: this.bug.projeto,
          Modulo: this.bug.modulo,
          Funcionalidade: this.bug.funcionalidade,
          Severidade: this.bug.severidade,
          Prioridade: this.bug.prioridade,
          Status: this.bug.status
        }
        : tipoDocumento === "execucao"
          ? {
            "Caso de teste": this.execucao.casoTeste || "Novo caso",
            Status: this.execucao.status,
            Executor: this.execucao.executor,
            Ambiente: this.execucao.ambiente,
            "Versao": this.execucao.versaoTestada,
            "Data": this.execucao.dataHora
          }
          : {
          Projeto: this.documentacao.projeto,
          Modulo: this.documentacao.modulo,
          Funcionalidade: this.documentacao.funcionalidade,
          Ambiente: this.documentacao.ambiente,
          Prioridade: this.documentacao.prioridade,
          "Tipo de teste": this.documentacao.tiposTeste,
          Status: this.documentacao.status
        };

      return { titulo, subtitulo, configuracoes: this.configuracoes, resumo, tipoDocumento, dados, evidencias: this.evidenciaArquivos[contexto], perfisSelecionados, contexto };
    },

    async exportarPdf(tipoDocumento) {
      const pacoteExportacao = this.montarDadosExportacao(tipoDocumento);

      if (this.contextoPossuiMidia(pacoteExportacao.contexto)) {
        const desejaHtml = confirm("Existem evidencias em video/GIF. Deseja exportar um HTML interativo para assistir as midias? Clique em Cancelar para manter PDF com links de download.");

        if (desejaHtml) {
          await this.exportarHtmlComEvidencias(tipoDocumento);
          return;
        }
      }

      await window.exportadorPdf.exportar(pacoteExportacao);
      this.baixarPartesGrandes(pacoteExportacao.contexto);
      this.registrarHistorico("exportacao", "pdf", `PDF exportado: ${pacoteExportacao.tipoDocumento}`);
      this.exibirToast("PDF exportado.");
    },

    async exportarPng(tipoDocumento) {
      const pacoteExportacao = this.montarDadosExportacao(tipoDocumento);

      await window.exportadorPdf.exportarPng(pacoteExportacao);
      this.baixarPartesGrandes(pacoteExportacao.contexto);
      this.registrarHistorico("exportacao", "png", `PNG exportado: ${pacoteExportacao.tipoDocumento}`);
      this.exibirToast("PNG exportado.");
    },

    classeStatus(status) {
      if (status === "Aprovado" || status === "Corrigido" || status === "Fechado") {
        return "badge--sucesso";
      }

      if (status === "Reprovado" || status === "Critica") {
        return "badge--erro";
      }

      if (status === "Bloqueado" || status === "Em analise") {
        return "badge--alerta";
      }

      return "";
    },

    exportarBackup() {
      const conteudoBackup = JSON.stringify(window.armazenamentoLocal.exportarTudo(), null, 2);
      this.baixarArquivo("qa-docs-studio-backup.json", conteudoBackup);
      this.registrarHistorico("exportacao", "backup", "Backup JSON exportado");
      this.exibirToast("Backup exportado.");
    },

    importarBackup(evento) {
      const arquivoSelecionado = evento.target.files[0];

      if (!arquivoSelecionado) {
        return;
      }

      const leitorArquivo = new FileReader();
      leitorArquivo.onload = () => {
        const backup = JSON.parse(leitorArquivo.result);
        window.armazenamentoLocal.importarTudo(backup);
        this.exibirToast("Backup importado. Recarregue a pagina.");
      };
      leitorArquivo.readAsText(arquivoSelecionado);
    },

    limparDadosSalvos() {
      const confirmouLimpeza = confirm("Deseja limpar todos os dados salvos localmente?");

      if (!confirmouLimpeza) {
        return;
      }

      window.armazenamentoLocal.limparTudo();
      location.reload();
    },

    exibirToast(mensagem) {
      this.toast.mensagem = mensagem;
      this.toast.visivel = true;
      setTimeout(() => {
        this.toast.visivel = false;
      }, 2600);
    }
  };
}

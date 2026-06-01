function qaDocsStudio() {
  return {
    telaAtual: "dashboard",
    menuAberto: false,
    abaDocumentacao: "identificacao",
    formatoSaida: "corporativo",
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
    passoArrastadoIndice: null,
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
      this.formatoSaida = this.configuracoes.modeloPadrao || "corporativo";
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
      return window.execucaoTeste.gerarResumo(this.execucao);
    },

    get textoBugReport() {
      return window.reportBug.gerarTexto(this.bug);
    },

    get htmlMarkdownDocumentacao() {
      return this.renderizarMarkdown(this.textoDocumentacaoFinal || "A documentacao formatada aparecera aqui.");
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
      this.textoDocumentacaoFinal = window.documentacaoTeste.gerarTexto(this.documentacao, this.configuracoes, this.formatoSaida);

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

      grupo.opcoes.push({ identificador: crypto.randomUUID(), rotulo: valorOpcao });
      this.novaOpcaoGrupo[grupo.campo] = "";
      this.salvarConfiguracoes();
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

    async exportarPdf(tipoDocumento) {
      const titulo = tipoDocumento === "bug" ? "Bug Report" : "Documentacao de Teste";
      const subtitulo = tipoDocumento === "bug" ? this.bug.titulo || "Defeito registrado" : this.documentacao.funcionalidade || "Caso de teste";
      const dados = tipoDocumento === "bug" ? this.bug : this.documentacao;
      const resumo = tipoDocumento === "bug"
        ? {
          Projeto: this.bug.projeto,
          Modulo: this.bug.modulo,
          Funcionalidade: this.bug.funcionalidade,
          Severidade: this.bug.severidade,
          Prioridade: this.bug.prioridade,
          Status: this.bug.status
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

      await window.exportadorPdf.exportar({ titulo, subtitulo, configuracoes: this.configuracoes, resumo, tipoDocumento, dados });
      this.exibirToast("PDF exportado.");
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

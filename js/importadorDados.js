window.importadorDados = (() => {
  const camposObrigatorios = {
    documentacoes: ["funcionalidade", "objetivo", "ambiente", "tiposTeste"],
    execucoes: ["cenario", "status", "executor", "resultadoEsperado", "resultadoObtido", "ambiente", "dataHora"],
    bugs: ["titulo", "passosReproduzir", "resultadoEsperado", "resultadoObtido", "severidade", "prioridade", "ambiente"],
    snippets: ["titulo", "texto"],
    glossario: ["nome", "definicao"]
  };

  const templates = {
    documentacoes: ["projetoCliente", "projeto", "modulo", "funcionalidade", "historiaUsuario", "canal", "ambiente", "prioridade", "tiposTeste", "objetivo", "escopo", "foraDeEscopo", "tecnicasTeste", "criteriosEntrada", "criteriosSaida", "criteriosSuspensaoRetomada", "riscosProduto", "riscosProjeto", "estrategiaExecucao", "cenario", "preCondicao", "massaDados", "resultadoEsperado", "resultadoObtido", "ferramentas", "metricasQualidade", "aprovacaoEncerramento", "status", "evidencias", "observacoes"],
    execucoes: ["projetoCliente", "casoTeste", "cenario", "status", "preCondicao", "massaDados", "passosExecutados", "resultadoEsperado", "resultadoObtido", "comentarios", "evidencias", "dataHora", "executor", "ambiente", "versaoTestada", "defeitosVinculados", "reteste", "regressao", "criticidade", "tecnicaTeste", "riscosEncontrados", "conclusaoQa"],
    bugs: ["projetoCliente", "projeto", "modulo", "funcionalidade", "titulo", "severidade", "prioridade", "frequencia", "ambiente", "versao", "dispositivo", "navegador", "usuarioUtilizado", "massaDados", "preCondicao", "passosReproduzir", "resultadoEsperado", "resultadoObtido", "evidencias", "impactoUsuario", "impactoNegocio", "impacto", "responsavel", "dataAbertura", "criterioAceiteCorrecao", "observacoesTecnicas", "sugestaoCorrecao", "status"],
    snippets: ["titulo", "categoria", "descricao", "texto", "tags"],
    glossario: ["nome", "definicao", "exemplo", "categoria"]
  };

  function detectarSeparadorCsv(linhaCabecalho) {
    return (linhaCabecalho.match(/;/g) || []).length > (linhaCabecalho.match(/,/g) || []).length ? ";" : ",";
  }

  function separarLinhaCsv(linha, separador = ",") {
    const valores = [];
    let valorAtual = "";
    let dentroDeAspas = false;

    for (const caractere of linha) {
      if (caractere === '"') {
        dentroDeAspas = !dentroDeAspas;
      } else if (caractere === separador && !dentroDeAspas) {
        valores.push(valorAtual.trim());
        valorAtual = "";
      } else {
        valorAtual += caractere;
      }
    }

    valores.push(valorAtual.trim());
    return valores.map((valor) => valor.replace(/^"|"$/g, ""));
  }

  function converterCsv(textoArquivo) {
    const linhas = textoArquivo.split(/\r?\n/).filter((linha) => linha.trim());
    const linhaCabecalho = linhas.shift() || "";
    const separador = detectarSeparadorCsv(linhaCabecalho);
    const cabecalhos = separarLinhaCsv(linhaCabecalho, separador);

    return linhas.map((linha) => {
      const valores = separarLinhaCsv(linha, separador);
      return cabecalhos.reduce((registro, cabecalho, indice) => {
        registro[cabecalho] = valores[indice] || "";
        return registro;
      }, {});
    });
  }

  function normalizarRegistro(tipoDados, registro) {
    const registroNormalizado = {
      identificador: registro.identificador || crypto.randomUUID(),
      criadoEm: registro.criadoEm || new Date().toISOString(),
      ...registro
    };

    if (tipoDados === "documentacoes") {
      registroNormalizado.passos = Array.isArray(registro.passos) ? registro.passos : [];
      registroNormalizado.tiposTeste = Array.isArray(registro.tiposTeste)
        ? registro.tiposTeste
        : String(registro.tiposTeste || registro.tipoTeste || "Funcional").split("|").map((valor) => valor.trim()).filter(Boolean);
    }

    registroNormalizado.projetoCliente = registroNormalizado.projetoCliente || registroNormalizado.projeto || "";

    return registroNormalizado;
  }

  function validarRegistros(tipoDados, registros) {
    const erros = [];
    const campos = camposObrigatorios[tipoDados] || [];

    registros.forEach((registro, indice) => {
      if (["documentacoes", "execucoes", "bugs"].includes(tipoDados) && !String(registro.projetoCliente || registro.projeto || "").trim()) {
        erros.push(`Linha ${indice + 1}: informe projetoCliente ou projeto.`);
      }

      campos.forEach((campo) => {
        if (!String(registro[campo] || "").trim()) {
          erros.push(`Linha ${indice + 1}: campo obrigatorio ausente (${campo}).`);
        }
      });
    });

    return erros;
  }

  function gerarCsvTemplate(tipoDados) {
    const campos = templates[tipoDados] || [];
    const exemplo = campos.map((campo) => {
      if (campo === "projeto") return "Projeto legado opcional";
      if (campo === "modulo") return tipoDados === "bugs" ? "Login" : "Autenticacao";
      if (campo === "funcionalidade") return tipoDados === "bugs" ? "Login" : "Login com usuario valido";
      if (campo === "historiaUsuario") return "US-001";
      if (campo === "canal") return "Web";
      if (campo === "tiposTeste") return "Funcional|Regressivo";
      if (campo === "status") return tipoDados === "bugs" ? "Novo" : "Nao executado";
      if (campo === "prioridade" || campo === "severidade") return "Media";
      if (campo === "frequencia") return "Sempre ocorre";
      if (campo === "ambiente") return "Homologacao";
      if (campo === "projetoCliente") return "Cliente Exemplo";
      if (campo === "objetivo") return "Validar os principais fluxos da funcionalidade antes da liberacao.";
      if (campo === "escopo") return "Fluxo principal, validacoes obrigatorias e mensagens de erro.";
      if (campo === "foraDeEscopo") return "Integracoes externas nao disponiveis no ambiente.";
      if (campo === "tecnicasTeste") return "Particao de equivalencia|Valor limite|Exploratorio";
      if (campo === "criteriosEntrada") return "Build disponivel, ambiente estavel e massa preparada.";
      if (campo === "criteriosSaida") return "Cenarios criticos executados, defeitos registrados e evidencias anexadas.";
      if (campo === "criteriosSuspensaoRetomada") return "Suspender em caso de bloqueio de ambiente ou defeito critico impeditivo.";
      if (campo === "riscosProduto") return "Falha em fluxo critico pode impedir uso da funcionalidade.";
      if (campo === "riscosProjeto") return "Ambiente instavel pode impactar prazo da validacao.";
      if (campo === "estrategiaExecucao") return "Executar smoke, cenarios por risco, reteste e regressao quando aplicavel.";
      if (campo === "cenario") return tipoDados === "execucoes" ? "Login com credenciais validas" : "Usuario realiza login no portal.";
      if (campo === "preCondicao") return "Usuario cadastrado e ambiente disponivel.";
      if (campo === "massaDados") return "usuario.teste@empresa.com";
      if (campo === "passosExecutados") return "1. Acessar login | 2. Informar credenciais | 3. Confirmar acesso";
      if (campo === "passosReproduzir") return "1. Acessar login | 2. Informar senha invalida | 3. Clicar em entrar";
      if (campo === "resultadoEsperado") return "Sistema deve apresentar o comportamento esperado de acordo com a regra de negocio.";
      if (campo === "resultadoObtido") return tipoDados === "bugs" ? "Sistema nao exibiu a mensagem de erro esperada." : "Resultado registrado durante a execucao.";
      if (campo === "comentarios") return "Execucao registrada para controle de qualidade.";
      if (campo === "evidencias") return "https://exemplo.local/evidencia";
      if (campo === "dataHora") return new Date().toISOString().slice(0, 16);
      if (campo === "executor") return "QA Exemplo";
      if (campo === "versaoTestada" || campo === "versao") return "1.0.0";
      if (campo === "defeitosVinculados") return "BUG-001";
      if (campo === "reteste") return "Nao aplicado";
      if (campo === "regressao") return "Nao aplicada";
      if (campo === "criticidade") return "Media";
      if (campo === "tecnicaTeste") return "Exploratorio";
      if (campo === "riscosEncontrados") return "Nenhum risco bloqueante identificado.";
      if (campo === "conclusaoQa") return "Execucao concluida conforme escopo informado.";
      if (campo === "titulo") return "[Login] Sistema nao exibe mensagem de erro ao informar senha invalida";
      if (campo === "dispositivo") return "Desktop";
      if (campo === "navegador") return "Chrome";
      if (campo === "usuarioUtilizado") return "usuario.teste@empresa.com";
      if (campo === "impactoUsuario") return "Usuario nao entende o motivo da falha no login.";
      if (campo === "impactoNegocio") return "Pode aumentar chamados de suporte.";
      if (campo === "impacto") return "Fluxo de autenticacao fica menos claro para o usuario.";
      if (campo === "responsavel") return "Squad Autenticacao";
      if (campo === "dataAbertura") return new Date().toISOString().slice(0, 10);
      if (campo === "criterioAceiteCorrecao") return "Exibir mensagem clara e manter os demais fluxos funcionando.";
      if (campo === "observacoesTecnicas") return "Validar retorno da API e tratamento de erro no front-end.";
      if (campo === "sugestaoCorrecao") return "Ajustar exibicao da mensagem de erro.";
      if (campo === "ferramentas") return "Navegador, Jira/Azure DevOps e repositorio de evidencias.";
      if (campo === "metricasQualidade") return "Cobertura, defeitos por severidade e taxa de aprovacao.";
      if (campo === "aprovacaoEncerramento") return "Encerrar apos criterios de saida atendidos.";
      if (campo === "observacoes") return "Sem observacoes adicionais.";
      return "";
    });
    return `${campos.join(",")}\n${exemplo.map((valor) => `"${valor}"`).join(",")}\n`;
  }

  function gerarJsonTemplate(tipoDados) {
    const campos = templates[tipoDados] || [];
    const exemplo = campos.reduce((registro, campo) => {
      registro[campo] = campo === "tiposTeste" ? ["Funcional"] : "";
      return registro;
    }, {});

    return JSON.stringify([exemplo], null, 2);
  }

  async function lerArquivo(arquivo, tipoDados) {
    const textoArquivo = await arquivo.text();
    const registros = arquivo.name.toLowerCase().endsWith(".json")
      ? JSON.parse(textoArquivo)
      : converterCsv(textoArquivo);
    const listaRegistros = Array.isArray(registros) ? registros : [registros];
    const erros = validarRegistros(tipoDados, listaRegistros);

    return {
      registros: listaRegistros.map((registro) => normalizarRegistro(tipoDados, registro)),
      erros
    };
  }

  return { lerArquivo, gerarCsvTemplate, gerarJsonTemplate };
})();

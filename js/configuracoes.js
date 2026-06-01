window.configuracoesQa = (() => {
  function criarGrupoOpcoes(nome, campo, selecaoMultipla, opcoes) {
    return {
      identificador: campo,
      nome,
      campo,
      selecaoMultipla,
      obrigatorio: true,
      opcoes: opcoes.map((rotulo) => ({ identificador: crypto.randomUUID(), rotulo }))
    };
  }

  function criarGruposOpcoesPadrao() {
    return [
      criarGrupoOpcoes("Canal", "canal", false, ["Web", "Mobile", "API", "Desktop"]),
      criarGrupoOpcoes("Ambiente", "ambiente", false, ["Desenvolvimento", "Homologacao", "Staging", "Producao"]),
      criarGrupoOpcoes("Prioridade", "prioridade", false, ["Baixa", "Media", "Alta", "Critica"]),
      criarGrupoOpcoes("Tipo de teste", "tiposTeste", true, ["Funcional", "Regressivo", "Smoke", "Exploratorio", "Integracao", "Usabilidade", "API", "Responsivo", "Seguranca"]),
      criarGrupoOpcoes("Status de teste", "statusTeste", false, ["Nao executado", "Aprovado", "Reprovado", "Bloqueado", "Em analise"]),
      criarGrupoOpcoes("Status de bug", "statusBug", false, ["Novo", "Em analise", "Corrigido", "Reteste", "Fechado"]),
      criarGrupoOpcoes("Severidade", "severidade", false, ["Baixa", "Media", "Alta", "Critica"]),
      criarGrupoOpcoes("Dispositivo", "dispositivo", false, ["Desktop", "Notebook", "Android", "iOS", "Tablet"]),
      criarGrupoOpcoes("Navegador", "navegador", false, ["Chrome", "Edge", "Firefox", "Safari", "Mobile Web"])
    ];
  }

  const configuracoesPadrao = {
    nomeProfissional: "",
    cargo: "QA Engineer",
    empresaCliente: "",
    projetoPadrao: "",
    ambientePadrao: "Homologacao",
    tema: "claro",
    preferenciaExportacao: "PDF",
    modeloPadrao: "corporativo",
    cabecalhoPdf: "QA Docs Studio",
    rodapePdf: "Documento gerado localmente para apoio a testes de software.",
    logoOpcional: "",
    atalhosAtivos: true,
    gruposOpcoes: criarGruposOpcoesPadrao()
  };

  function criarConfiguracoes() {
    return JSON.parse(JSON.stringify(configuracoesPadrao));
  }

  function normalizarConfiguracoes(configuracoes) {
    const configuracoesBase = criarConfiguracoes();
    const configuracoesNormalizadas = { ...configuracoesBase, ...configuracoes };
    const gruposExistentes = Array.isArray(configuracoesNormalizadas.gruposOpcoes) ? configuracoesNormalizadas.gruposOpcoes : [];

    configuracoesBase.gruposOpcoes.forEach((grupoPadrao) => {
      if (!gruposExistentes.some((grupo) => grupo.campo === grupoPadrao.campo)) {
        gruposExistentes.push(grupoPadrao);
      }
    });

    configuracoesNormalizadas.gruposOpcoes = gruposExistentes.map((grupo) => ({
      ...grupo,
      identificador: grupo.identificador || grupo.campo || crypto.randomUUID(),
      obrigatorio: grupo.obrigatorio !== false,
      selecaoMultipla: Boolean(grupo.selecaoMultipla),
      opcoes: Array.isArray(grupo.opcoes) && grupo.opcoes.length > 0
        ? grupo.opcoes.map((opcao) => typeof opcao === "string" ? { identificador: crypto.randomUUID(), rotulo: opcao } : { identificador: opcao.identificador || crypto.randomUUID(), rotulo: opcao.rotulo || "" })
        : [{ identificador: crypto.randomUUID(), rotulo: "Padrao" }]
    }));

    return configuracoesNormalizadas;
  }

  return { criarConfiguracoes, normalizarConfiguracoes, criarGruposOpcoesPadrao };
})();

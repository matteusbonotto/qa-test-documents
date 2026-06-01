window.glossarioQa = (() => {
  const termosPadrao = [
    ["Caso de teste", "Documento que descreve condicoes, passos e resultados esperados.", "Validar login com usuario ativo.", "Documentacao"],
    ["Cenario de teste", "Situacao de negocio que sera validada.", "Cliente realiza pagamento via PIX.", "Planejamento"],
    ["Pre-condicao", "Condicao necessaria antes da execucao.", "Usuario cadastrado e ativo.", "Execucao"],
    ["Massa de teste", "Dados usados para executar validacoes.", "CPF, e-mail, perfil e saldo.", "Execucao"],
    ["Resultado esperado", "Comportamento que o sistema deve apresentar.", "Mensagem de sucesso exibida.", "Resultado"],
    ["Resultado obtido", "Comportamento observado durante a execucao.", "Erro 500 apresentado.", "Resultado"],
    ["Bug", "Comportamento divergente do esperado.", "Botao salvar nao conclui cadastro.", "Defeitos"],
    ["Defeito", "Problema identificado no produto ou codigo.", "Regra de calculo incorreta.", "Defeitos"],
    ["Falha", "Manifestacao visivel de um defeito.", "Sistema fecha ao anexar arquivo.", "Defeitos"],
    ["Severidade", "Nivel de impacto tecnico ou de negocio.", "Critica quando impede venda.", "Classificacao"],
    ["Prioridade", "Urgencia de tratamento do problema.", "Alta para defeito em release atual.", "Classificacao"],
    ["Smoke test", "Validacao rapida das funcionalidades essenciais.", "Login, menu principal e operacao basica.", "Tipos de teste"],
    ["Teste regressivo", "Teste para garantir que mudancas nao quebraram fluxos existentes.", "Reexecutar compras apos ajuste fiscal.", "Tipos de teste"],
    ["Teste exploratorio", "Investigacao livre e estruturada do produto.", "Explorar filtros sem roteiro fechado.", "Tipos de teste"],
    ["Teste funcional", "Valida requisitos e regras de negocio.", "Calcular desconto conforme politica.", "Tipos de teste"],
    ["Teste nao funcional", "Valida atributos como performance e seguranca.", "Tempo de resposta abaixo de 2s.", "Tipos de teste"],
    ["Criterio de aceite", "Condicao que define se a historia esta pronta.", "Deve enviar e-mail ao concluir pedido.", "Agil"],
    ["Evidencia de teste", "Registro que comprova a execucao.", "Print, video, log ou protocolo.", "Execucao"],
    ["Automacao de teste", "Uso de scripts para executar validacoes.", "Pipeline executa testes de API.", "Automacao"],
    ["Shift-left testing", "Antecipacao das atividades de teste no ciclo.", "QA revisa criterio antes do desenvolvimento.", "Agil"],
    ["BDD", "Pratica que descreve comportamento esperado em linguagem colaborativa.", "Dado, Quando, Entao.", "Agil"],
    ["Gherkin", "Sintaxe usada para cenarios BDD.", "Dado que estou logado...", "Agil"]
  ];

  function criarGlossarioPadrao() {
    return termosPadrao.map(([nome, definicao, exemplo, categoria]) => ({
      identificador: crypto.randomUUID(),
      nome,
      definicao,
      exemplo,
      categoria
    }));
  }

  function criarTermo() {
    return {
      identificador: crypto.randomUUID(),
      nome: "",
      definicao: "",
      exemplo: "",
      categoria: ""
    };
  }

  return { criarGlossarioPadrao, criarTermo };
})();

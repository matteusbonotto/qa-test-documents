window.snippetsQa = (() => {
  const snippetsPadrao = [
    ["Login com sucesso", "Autenticacao", "Validar acesso com credenciais validas.", "Dado que o usuario esta na tela de login\nQuando informa credenciais validas\nEntao o sistema deve autenticar e direcionar para a area logada", "login, sucesso"],
    ["Login com credenciais invalidas", "Autenticacao", "Validar bloqueio de acesso indevido.", "Dado que o usuario esta na tela de login\nQuando informa credenciais invalidas\nEntao o sistema deve negar acesso e exibir mensagem clara", "login, erro"],
    ["Validacao de campo obrigatorio", "Formulario", "Validar mensagens de obrigatoriedade.", "Quando o usuario tenta salvar sem preencher campos obrigatorios\nEntao o sistema deve destacar os campos e apresentar mensagem objetiva", "formulario, obrigatorio"],
    ["Validacao de permissao", "Seguranca", "Validar acesso por perfil.", "Dado um usuario sem permissao\nQuando tenta acessar recurso restrito\nEntao o sistema deve bloquear a acao", "permissao, perfil"],
    ["Validacao de layout responsivo", "Interface", "Validar comportamento em diferentes viewports.", "Verificar que elementos principais permanecem visiveis, alinhados e utilizaveis em desktop, tablet e celular", "responsivo, layout"],
    ["Validacao de fluxo PIX", "Financeiro", "Validar geracao e confirmacao de pagamento PIX.", "Executar fluxo completo de PIX e confirmar status, comprovante, valores e mensagens exibidas", "pix, financeiro"]
  ];

  function criarSnippet() {
    return {
      identificador: crypto.randomUUID(),
      titulo: "",
      categoria: "",
      descricao: "",
      texto: "",
      tags: ""
    };
  }

  function criarSnippetsPadrao() {
    return snippetsPadrao.map(([titulo, categoria, descricao, texto, tags]) => ({
      identificador: crypto.randomUUID(),
      titulo,
      categoria,
      descricao,
      texto,
      tags
    }));
  }

  return { criarSnippet, criarSnippetsPadrao };
})();

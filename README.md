# QA Docs Studio

QA Docs Studio e um WebApp PWA para produtividade de QA. O MVP permite criar documentacoes de teste, registrar execucoes, gerar bug reports, manter snippets reutilizaveis, consultar glossario, exportar PDF e persistir dados localmente.

## Arquitetura

- `index.html`: shell da SPA com Alpine.js.
- `css/styles.css`: design system responsivo com tema claro e escuro.
- `js/app.js`: estado principal, navegacao, acoes e integracao dos modulos.
- `js/armazenamentoLocal.js`: persistencia em `localStorage`.
- `js/documentacaoTeste.js`: criacao e templates de documentacao.
- `js/execucaoTeste.js`: modelo e resumo de execucao.
- `js/reportBug.js`: modelo e texto de bug report.
- `js/snippetsQa.js`: biblioteca inicial de snippets.
- `js/glossarioQa.js`: glossario inicial.
- `js/exportadorPdf.js`: exportacao com `html2pdf.js`.
- `js/atalhosTeclado.js`: atalhos de produtividade.
- `manifest.json` e `serviceWorker.js`: instalacao e cache basico offline.
- `vendor/`: Alpine.js, Lucide e html2pdf locais para reduzir dependencia de CDN.

## Telas principais

- Dashboard com metricas, atalhos e ultimos documentos.
- Dashboard com metricas, atalhos, painel de destaque e ultimos documentos.
- Gerador de documentacao com abas, presets, toggles, multiselect de tipos de teste, passos dinamicos e saidas corporativa, Markdown e Jira / Zephyr.
- Execucao de teste com status por controle segmentado, evidencias, executor, ambiente e versao.
- Report de bug copiavel e exportavel com selecoes rapidas de severidade, prioridade, ambiente, dispositivo e navegador.
- Snippets com busca, edicao, copia e exclusao.
- Glossario de QA com busca rapida.
- Atalhos documentados no proprio sistema.
- Configuracoes com tema, dados profissionais, exportacao, backup e limpeza local.
- Configuracoes dos botoes/toggles dos formularios, com edicao de nomes, novas opcoes, exclusao, obrigatoriedade e multiselect.
- Importacao CSV/JSON por tipo de dado, download de templates e validacao de erros antes de salvar.
- Historico local de criacoes, edicoes, exclusoes, execucoes, importacoes e exportacoes.
- Drag and drop para reorganizar passos de teste.

## Como executar localmente

Por ser um PWA com service worker, execute em servidor local:

```bash
python -m http.server 5173
```

Acesse:

```txt
http://localhost:5173
```

## Como testar o PWA

1. Abra o app em `http://localhost:5173`.
2. Use as telas principais e salve um rascunho.
3. Abra DevTools > Application.
4. Confirme `Manifest` e `Service Workers`.
5. Ative modo offline no navegador.
6. Recarregue a pagina e valide o carregamento basico.
7. No navegador, use a opcao de instalar app quando disponivel.

## Atalhos

- `Ctrl + S`: salvar rascunho.
- `Ctrl + D`: alternar tema.
- `Ctrl + Enter`: gerar documentacao.
- `Esc`: fechar menu mobile.
- `Ctrl + Shift + C`: copiar documentacao final.

## Importacao de dados

Na tela de Configuracoes, selecione o tipo de dados, baixe um template CSV ou JSON, preencha os campos e importe o arquivo. O sistema valida campos obrigatorios e mostra os erros antes de gravar localmente.

## Evolucoes futuras

- IndexedDB para anexos reais e evidencias pesadas.
- Importacao de casos via CSV.
- Templates customizados por projeto.
- Campos dinamicos por tipo de teste.
- Integracao com Jira, Azure DevOps e Zephyr.
- Historico de versoes por documento.
- Editor rico para evidencias e Markdown.

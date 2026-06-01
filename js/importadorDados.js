window.importadorDados = (() => {
  const camposObrigatorios = {
    documentacoes: ["projeto", "funcionalidade"],
    execucoes: ["status", "executor"],
    bugs: ["titulo", "resultadoObtido"],
    snippets: ["titulo", "texto"],
    glossario: ["nome", "definicao"]
  };

  const templates = {
    documentacoes: ["projeto", "modulo", "funcionalidade", "historiaUsuario", "canal", "ambiente", "prioridade", "tiposTeste", "cenario", "preCondicao", "massaDados", "resultadoEsperado", "resultadoObtido", "status", "evidencias", "observacoes"],
    execucoes: ["casoTeste", "status", "comentarios", "evidencias", "dataHora", "executor", "ambiente", "versaoTestada"],
    bugs: ["projeto", "modulo", "funcionalidade", "titulo", "severidade", "prioridade", "ambiente", "versao", "dispositivo", "navegador", "usuarioUtilizado", "massaDados", "preCondicao", "passosReproduzir", "resultadoEsperado", "resultadoObtido", "evidencias", "impacto", "sugestaoCorrecao", "status"],
    snippets: ["titulo", "categoria", "descricao", "texto", "tags"],
    glossario: ["nome", "definicao", "exemplo", "categoria"]
  };

  function separarLinhaCsv(linha) {
    const valores = [];
    let valorAtual = "";
    let dentroDeAspas = false;

    for (const caractere of linha) {
      if (caractere === '"') {
        dentroDeAspas = !dentroDeAspas;
      } else if (caractere === "," && !dentroDeAspas) {
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
    const cabecalhos = separarLinhaCsv(linhas.shift() || "");

    return linhas.map((linha) => {
      const valores = separarLinhaCsv(linha);
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

    return registroNormalizado;
  }

  function validarRegistros(tipoDados, registros) {
    const erros = [];
    const campos = camposObrigatorios[tipoDados] || [];

    registros.forEach((registro, indice) => {
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
    return `${campos.join(",")}\n`;
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

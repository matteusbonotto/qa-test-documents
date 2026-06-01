window.exportadorPdf = (() => {
  function escaparHtml(texto) {
    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function montarLinhasResumo(resumo) {
    return Object.entries(resumo || {})
      .map(([rotulo, valor]) => `<tr><th>${escaparHtml(rotulo)}</th><td>${escaparHtml(valor || "-")}</td></tr>`)
      .join("");
  }

  function montarDocumentoPdf({ titulo, subtitulo, corpo, configuracoes, resumo }) {
    const geradoEm = new Date().toLocaleString("pt-BR");
    const profissional = configuracoes.nomeProfissional || "QA";
    const logo = configuracoes.logoOpcional ? `<img src="${escaparHtml(configuracoes.logoOpcional)}" alt="" style="max-height: 52px; max-width: 160px; object-fit: contain;" />` : "";

    return `
      <article class="documento-pdf">
        <header>
          ${logo}
          <h1>${escaparHtml(titulo)}</h1>
          <p>${escaparHtml(subtitulo)}</p>
          <p>${escaparHtml(configuracoes.cabecalhoPdf || "QA Docs Studio")}</p>
          <p><strong>QA:</strong> ${escaparHtml(profissional)} | <strong>Gerado em:</strong> ${geradoEm}</p>
        </header>
        <section>
          <h2>Sumario</h2>
          <ol>
            <li>Identificacao</li>
            <li>Procedimentos e resultados</li>
            <li>Evidencias e observacoes</li>
          </ol>
        </section>
        <section>
          <h2>Identificacao</h2>
          <table>
            <tbody>${montarLinhasResumo(resumo)}</tbody>
          </table>
        </section>
        <section>
          <h2>Conteudo</h2>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5;">${escaparHtml(corpo)}</pre>
        </section>
        <footer>${escaparHtml(configuracoes.rodapePdf || "QA Docs Studio")}</footer>
      </article>
    `;
  }

  async function exportar({ titulo, subtitulo, corpo, configuracoes, resumo }) {
    const areaPdf = document.getElementById("areaPdf");
    areaPdf.innerHTML = montarDocumentoPdf({ titulo, subtitulo, corpo, configuracoes, resumo });

    const opcoesPdf = {
      margin: 0,
      filename: `${titulo.toLowerCase().replaceAll(" ", "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
    };

    await html2pdf().set(opcoesPdf).from(areaPdf).save();
    areaPdf.innerHTML = "";
  }

  return { exportar };
})();

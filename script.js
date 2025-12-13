console.log("Carregando JavaScript...");

document.addEventListener("DOMContentLoaded", function () {
  console.log("Página carregada");
  updateMonth();
  carregarDados(); // Carregar dados salvos
  calcularTotais();
});

// Configura o worker do PDF.js para a conversão em imagem no gerarJPG
if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function updateMonth() {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentDate = new Date();
  document.getElementById("currentMonth").textContent =
    months[currentDate.getMonth()];
}

function excluirLinha(button) {
  const row = button.closest("tr");
  const table = button.closest("table");
  const tbody = table ? table.tBodies[0] : null;
  const dataRowsCount = tbody
    ? tbody.rows.length
    : table
    ? table.rows.length - (table.tHead ? table.tHead.rows.length : 0)
    : 0;

  // Não permite excluir se for a última linha de dados
  if (dataRowsCount > 1) {
    row.remove();
    calcularTotais(); // Atualiza os totais após excluir
  } else {
    alert("Não é possível excluir a última linha da tabela!");
  }
}

// Modificar as funções adicionarAluno e adicionarDespesa para incluir o botão de excluir
function adicionarAluno() {
  try {
    const tabela = document.getElementById("tabelaAlunos");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="alunoNome[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="alunoQtd[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
            <td><input type="number" name="alunoValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
            <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
        `;

    calcularTotais();
    console.log("Novo grude adicionado");
  } catch (error) {
    console.error("Erro ao adicionar grude:", error);
  }
}

function adicionarGrudeFresca() {
  try {
    const tabela = document
      .getElementById("tabelaGrudeFresca")
      .querySelector("tbody");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="grudeFrescaNome[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="grudeFrescaKg[]" step="0.01" min="0" oninput="atualizarMetade(this)" /></td>
            <td><input type="number" name="grudeFrescaKgMetade[]" step="0.01" min="0" readonly /></td>
            <td><input type="number" name="grudeFrescaValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
            <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
        `;

    calcularTotais();
    console.log("Novo grude fresca adicionado");
  } catch (error) {
    console.error("Erro ao adicionar grude fresca:", error);
  }
}

function atualizarMetade(inputKg) {
  const row = inputKg.closest("tr");
  const metadeInput = row.querySelector('input[name="grudeFrescaKgMetade[]"]');
  if (!metadeInput) return;

  const kg = parseFloat(inputKg.value) || 0;
  metadeInput.value = kg ? (kg / 2).toFixed(2) : "";
  calcularTotais();
}

function adicionarDespesa() {
  try {
    const tabela = document.getElementById("tabelaDespesas");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="despesaDescricao[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="despesaValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
            <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
        `;

    calcularTotais();
    console.log("Nova despesa adicionada");
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error);
  }
}

function calcularTotais() {
  try {
    let totalEntradas = 0;
    let totalDespesas = 0;
    let totalQuantidade = 0;

    // Calcula total de entradas (quantidade * valor por kg)
    const quantidades = document.getElementsByName("alunoQtd[]");
    const valores = document.getElementsByName("alunoValor[]");

    for (let i = 0; i < quantidades.length; i++) {
      if (quantidades[i].value && valores[i].value) {
        const quantidade = parseFloat(quantidades[i].value);
        const valorPorKg = parseFloat(valores[i].value);
        totalEntradas += quantidade * valorPorKg;
        totalQuantidade += quantidade;
      }
    }

    // Calcula entradas de grude fresca usando metade do KG
    const grudeFrescaKg = document.getElementsByName("grudeFrescaKg[]");
    const grudeFrescaMetade = document.getElementsByName(
      "grudeFrescaKgMetade[]"
    );
    const grudeFrescaValor = document.getElementsByName("grudeFrescaValor[]");

    for (let i = 0; i < grudeFrescaKg.length; i++) {
      const kg = parseFloat(grudeFrescaKg[i].value || 0);
      const valorKg = parseFloat(grudeFrescaValor[i].value || 0);
      const metade = kg / 2;

      if (grudeFrescaMetade[i]) {
        grudeFrescaMetade[i].value =
          grudeFrescaKg[i].value === "" ? "" : metade.toFixed(2);
      }

      if (grudeFrescaKg[i].value || grudeFrescaValor[i].value) {
        totalEntradas += metade * valorKg;
        totalQuantidade += metade;
      }
    }

    // Calcula total de despesas
    document.getElementsByName("despesaValor[]").forEach((input) => {
      if (input.value) {
        totalDespesas += parseFloat(input.value);
      }
    });

    const totalReceita = totalEntradas - totalDespesas;

    // Atualiza os valores na tela com formatação de moeda
    document.getElementById("totalEntradas").textContent =
      totalEntradas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    document.getElementById("totalQuantidade").textContent =
      totalQuantidade.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    document.getElementById("totalDespesas").textContent =
      totalDespesas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    document.getElementById("totalReceita").textContent =
      totalReceita.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    console.log("Totais atualizados:", {
      totalEntradas,
      totalDespesas,
      totalReceita,
      totalQuantidade,
      grudeFresca: {
        linhas: grudeFrescaKg.length,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function exportToExcel() {
  try {
    const workbook = XLSX.utils.book_new();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Coletar dados dos grudes e despesas
    const nomes = document.getElementsByName("alunoNome[]");
    const quantidades = document.getElementsByName("alunoQtd[]");
    const valores = document.getElementsByName("alunoValor[]");
    const grudeFrescaNome = document.getElementsByName("grudeFrescaNome[]");
    const grudeFrescaKg = document.getElementsByName("grudeFrescaKg[]");
    const grudeFrescaValor = document.getElementsByName("grudeFrescaValor[]");
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    // Montar linhas conforme o modelo
    const data = [];

    // Cabeçalho vazio para o título
    data.push([null, null, null, null, null]);
    // Título mesclado
    data.push([
      `JML-PESCADOS - BALANCETE - MÊS DE ${mesAtual}`,
      null,
      null,
      null,
      null,
    ]);
    data.push(["GRUDE SECA", null, null, null, null]);
    // Cabeçalho das colunas em caixa alta
    data.push(["GRUDE SECA", "QTD (KG)", "VALOR/KG", "TOTAL", null]);

    let totalEntradas = 0;
    let totalQuantidade = 0;
    let totalDespesas = 0;

    // Adicionar dados dos grudes
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        const quantidade = parseFloat(quantidades[i].value || 0);
        const valorPorKg = parseFloat(valores[i].value || 0);
        const total = quantidade * valorPorKg;

        data.push([nomes[i].value, quantidade, valorPorKg, total, null]);

        totalEntradas += total;
        totalQuantidade += quantidade;
      }
    }

    // Linha em branco
    data.push([null, null, null, null, null]);

    // Grude fresca
    data.push(["GRUDE FRESCA", null, null, null, null]);
    data.push(["GRUDES", "KG", "KG 1/2", "VALOR/KG", "TOTAL"]);

    for (let i = 0; i < grudeFrescaNome.length; i++) {
      if (
        grudeFrescaNome[i].value ||
        grudeFrescaKg[i].value ||
        grudeFrescaValor[i].value
      ) {
        const kg = parseFloat(grudeFrescaKg[i].value || 0);
        const kgMetade = kg / 2;
        const valorKg = parseFloat(grudeFrescaValor[i].value || 0);
        const total = kgMetade * valorKg;

        data.push([grudeFrescaNome[i].value, kg, kgMetade, valorKg, total]);

        totalEntradas += total;
        totalQuantidade += kgMetade;
      }
    }

    // Linha em branco
    data.push([null, null, null, null, null]);

    // Cabeçalho das despesas
    data.push(["DESPESAS", null, null, null, null]);
    data.push(["Descrição", "Valor", null, null, null]);

    // Adicionar dados das despesas
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        const valor = parseFloat(valoresDespesa[i].value || 0);
        data.push([descricoes[i].value, valor, null, null, null]);
        totalDespesas += valor;
      }
    }

    // Linha em branco
    data.push([null, null, null, null, null]);

    // Totais
    data.push(["RESUMO", null, null, null, null]);
    data.push(["Entradas", totalEntradas, null, null, null]);
    data.push(["QTD Total (KG)", totalQuantidade, null, null, null]);
    data.push(["Despesas", totalDespesas, null, null, null]);
    data.push(["Saldo", totalEntradas - totalDespesas, null, null, null]);

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Mesclar células para o título
    ws["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Título
      {
        s: { r: data.findIndex((row) => row[0] === "RESUMO"), c: 0 },
        e: { r: data.findIndex((row) => row[0] === "RESUMO"), c: 4 },
      }, // RESUMO
    ];

    // Configurar largura das colunas
    ws["!cols"] = [
      { wch: 30 }, // Coluna A - GRUDES/Descrição
      { wch: 15 }, // Coluna B - Valores
      { wch: 15 }, // Coluna C - Valores
      { wch: 15 }, // Coluna D - Valores
      { wch: 15 }, // Coluna E - Valores
    ];

    // Formatar células numéricas
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        // Formatar células de valores (colunas B, C e D)
        if (C > 0 && typeof ws[cell_ref].v === "number") {
          ws[cell_ref].z = "#,##0.00";
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, "Balancete");
    XLSX.writeFile(workbook, `balancete_${mesAtual.toLowerCase()}.xlsx`);
    console.log("Excel exportado com sucesso");
  } catch (erro) {
    console.error("Erro ao exportar Excel:", erro);
    alert("Erro ao exportar para Excel!");
  }
}

async function gerarPDF() {
  try {
    const { doc, mesAtual } = await criarDocumentoBalancete();
    doc.save(`balancete_${mesAtual.toLowerCase()}.pdf`);

    console.log("PDF gerado com sucesso");
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro ao gerar PDF!");
  }
}

async function gerarJPG() {
  try {
    const { doc, mesAtual } = await criarDocumentoBalancete();
    const pdfData = doc.output("arraybuffer");

    if (!window.pdfjsLib) {
      throw new Error("PDF.js não carregado para gerar JPG.");
    }

    const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataURL = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `balancete_${mesAtual.toLowerCase()}.jpg`;
    link.click();

    console.log("JPG gerado com sucesso");
  } catch (erro) {
    console.error("Erro ao gerar JPG:", erro);
    alert("Erro ao gerar JPG!");
  }
}

async function criarDocumentoBalancete() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logo = await loadImage("public/LogoPreta.png");
  const mesAtual = document.getElementById("currentMonth").textContent;
  const marginX = 10;
  const rowHeight = 9;
  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const dataRelatorio = new Date().toLocaleDateString("pt-BR"); // dd/mm/aaaa
  const totalTableWidth = 190; // largura fixa para alinhar todos os quadros
  const colWidths = [80, 35, 35, 40]; // tabela grude seca (soma 190)
  const colWidthsFresca = [60, 30, 30, 30, 40]; // tabela grude fresca (mais espaço no TOTAL)
  const twoColWidths = [totalTableWidth - 70, 70];
  const supplierLabel = "FORNECEDOR";
  const supplierLabelWidth = Math.min(
    Math.max(doc.getTextWidth(supplierLabel) + 4, 30),
    45
  ); // largura adaptável, mais justa ao texto
  const supplierColWidths = [
    supplierLabelWidth,
    totalTableWidth - supplierLabelWidth,
  ];
  doc.setLineWidth(0.2);

  const fornecedorNome = (
    document.getElementById("supplierName")?.value || ""
  )
    .trim()
    .toUpperCase();

  const nomes = document.getElementsByName("alunoNome[]");
  const quantidades = document.getElementsByName("alunoQtd[]");
  const valores = document.getElementsByName("alunoValor[]");
  const grudeFrescaNome = document.getElementsByName("grudeFrescaNome[]");
  const grudeFrescaKg = document.getElementsByName("grudeFrescaKg[]");
  const grudeFrescaValor = document.getElementsByName("grudeFrescaValor[]");
  const descricoes = document.getElementsByName("despesaDescricao[]");
  const valoresDespesa = document.getElementsByName("despesaValor[]");

  const grudes = [];
  for (let i = 0; i < nomes.length; i++) {
    if (nomes[i].value) {
      const quantidade = parseFloat(quantidades[i].value || 0);
      const valorPorKg = parseFloat(valores[i].value || 0);
      grudes.push({
        nome: nomes[i].value,
        quantidade,
        valor: valorPorKg,
        total: quantidade * valorPorKg,
      });
    }
  }

  const grudesFresca = [];
  for (let i = 0; i < grudeFrescaNome.length; i++) {
    if (
      grudeFrescaNome[i].value ||
      grudeFrescaKg[i].value ||
      grudeFrescaValor[i].value
    ) {
      const kg = parseFloat(grudeFrescaKg[i].value || 0);
      const kgMetade = kg / 2;
      const valorPorKg = parseFloat(grudeFrescaValor[i].value || 0);
      grudesFresca.push({
        nome: grudeFrescaNome[i].value,
        kg,
        kgMetade,
        valor: valorPorKg,
        total: kgMetade * valorPorKg,
      });
    }
  }

  const despesas = [];
  for (let i = 0; i < descricoes.length; i++) {
    if (descricoes[i].value) {
      const valor = parseFloat(valoresDespesa[i].value || 0);
      despesas.push({ descricao: descricoes[i].value, valor });
    }
  }

  const totalEntradasPadrão = grudes.reduce((acc, item) => acc + item.total, 0);
  const totalEntradasFresca = grudesFresca.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const totalQuantidadeSeca = grudes.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );
  const totalKgFresca = grudesFresca.reduce((acc, item) => acc + item.kg, 0);
  const totalQuantidadeFresca = grudesFresca.reduce(
    (acc, item) => acc + item.kgMetade,
    0
  );
  const totalEntradas = totalEntradasPadrão + totalEntradasFresca;
  const totalQuantidade = totalQuantidadeSeca + totalQuantidadeFresca;
  const totalDespesas = despesas.reduce((acc, item) => acc + item.valor, 0);
  const saldo = totalEntradas - totalDespesas;

  const drawMergedRow = (
    text,
    startY,
    width = totalTableWidth,
    align = "center"
  ) => {
    doc.setFont("helvetica", "bold");
    doc.rect(marginX, startY, width, rowHeight);
    const textX = align === "left" ? marginX + 2 : marginX + width / 2;
    doc.text(String(text), textX, startY + rowHeight / 2 + 2, { align });
    return startY + rowHeight;
  };

  const drawHeaderRow = (
    cells,
    startY,
    widths,
    alignments = [],
    boldFlags = []
  ) => {
    let x = marginX;
    cells.forEach((cell, index) => {
      const cellWidth = widths[index];
      const isBold = boldFlags[index] !== undefined ? boldFlags[index] : true;
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.rect(x, startY, cellWidth, rowHeight);
      doc.text(
        String(cell || ""),
        alignments[index] === "left" ? x + 2 : x + cellWidth / 2,
        startY + rowHeight / 2 + 2,
        { align: alignments[index] || "center" }
      );
      x += cellWidth;
    });
    return startY + rowHeight;
  };

  const drawRows = (rows, startY, widths, alignments = []) => {
    let y = startY;
    rows.forEach((row) => {
      const isSaldoOuTotal = row[0] === "SALDO" || row[0] === "TOTAL";
      doc.setFont("helvetica", isSaldoOuTotal ? "bold" : "normal");
      let x = marginX;
      row.forEach((cell, index) => {
        const cellWidth = widths[index];
        const text = cell == null ? "" : cell;
        const align =
          alignments[index] || (index === 0 ? "left" : "right");
        const textX =
          align === "right"
            ? x + cellWidth - 2
            : align === "center"
            ? x + cellWidth / 2
            : x + 2;
        doc.rect(x, y, cellWidth, rowHeight);
        doc.text(String(text), textX, y + rowHeight / 2 + 2, { align });
        x += cellWidth;
      });
      y += rowHeight;
    });
    return y;
  };

  // Cabeçalho visual centralizado com logo preta e texto sublinhado em preto
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  const logoWidth = 30;
  const logoHeight = 30;
  const logoY = 10;
  const headerText = "JML-Pescados";
  const cnpjText = "CNPJ: 41.700.688/0001-08";
  const textWidth = doc.getTextWidth(headerText);
  const separatorLength = 10; // traço mais curto
  const separatorGap = 6;
  const spacerAfterLogo = 3;

  const headerGroupWidth =
    logoWidth + spacerAfterLogo + separatorLength + separatorGap + textWidth;
  const startX = marginX + (totalTableWidth - headerGroupWidth) / 2;

  const logoX = startX;
  doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

  const midY = logoY + logoHeight / 2;
  const lineY = midY + 1; // leve ajuste para parecer centralizado
  const lineX1 = logoX + logoWidth + spacerAfterLogo;
  const lineX2 = lineX1 + separatorLength;
  const previousLineWidth = doc.getLineWidth();
  doc.setLineWidth(0.8);
  doc.line(lineX1, lineY, lineX2, lineY);

  const textX = lineX2 + separatorGap;
  const textY = midY + 3; // levanta mais o texto para alinhar com a logo
  doc.text(headerText, textX, textY);

  const underlineWidth = textWidth; // sublinhado ajustado ao tamanho do texto
  doc.line(textX, textY + 2, textX + underlineWidth, textY + 2);

  // CNPJ abaixo do nome (negrito e centralizado em relação ao título)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const cnpjY = textY + 8;
  doc.text(cnpjText, textX + underlineWidth / 2, cnpjY, { align: "center" });

  doc.setLineWidth(previousLineWidth);
  doc.setFontSize(12);

  const headerBottom = Math.max(logoY + logoHeight, cnpjY + 3);
  let currentY = headerBottom + 6;

  currentY = drawMergedRow("BALANCETE", currentY);
  currentY = drawMergedRow(
    `JML-PESCADOS - ${dataRelatorio}`,
    currentY,
    totalTableWidth,
    "left"
  );

  currentY = drawHeaderRow(
    ["FORNECEDOR", fornecedorNome || "-"],
    currentY,
    supplierColWidths,
    ["left", "left"],
    [true, false]
  );

  currentY += rowHeight; // linha em branco antes dos quadros

  const grudeRows = grudes.length
    ? grudes.map((item) => [
        item.nome,
        formatNumber(item.quantidade),
        formatNumber(item.valor),
        formatNumber(item.total),
      ])
    : [["-", "0,00", "0,00", "0,00"]];
  const grudeRowsWithTotal = [
    ...grudeRows,
    [
      "TOTAL",
      formatNumber(totalQuantidadeSeca),
      "",
      formatNumber(totalEntradasPadrão),
    ],
  ];

  currentY = drawHeaderRow(
    ["GRUDE SECA", "QTD (KG)", "VALOR/KG", "TOTAL"],
    currentY,
    colWidths,
    ["left", "center", "center", "center"]
  );
  currentY = drawRows(
    grudeRowsWithTotal,
    currentY,
    colWidths,
    ["left", "center", "center", "center"]
  );

  currentY += rowHeight; // linha em branco

  const grudeFrescaRows = grudesFresca.length
    ? grudesFresca.map((item) => [
        item.nome,
        formatNumber(item.kg),
        formatNumber(item.kgMetade),
        formatNumber(item.valor),
        formatNumber(item.total),
      ])
    : [["-", "0,00", "0,00", "0,00", "0,00"]];
  const grudeFrescaRowsWithTotal = [
    ...grudeFrescaRows,
    [
      "TOTAL",
      formatNumber(totalKgFresca),
      formatNumber(totalQuantidadeFresca),
      "",
      formatNumber(totalEntradasFresca),
    ],
  ];

  currentY = drawMergedRow(
    "GRUDE FRESCA",
    currentY,
    colWidthsFresca.reduce((acc, w) => acc + w, 0),
    "left"
  );
  currentY = drawHeaderRow(
    ["GRUDES", "KG", "KG 1/2", "VALOR/KG", "TOTAL"],
    currentY,
    colWidthsFresca,
    ["left", "center", "center", "center", "center"]
  );
  currentY = drawRows(
    grudeFrescaRowsWithTotal,
    currentY,
    colWidthsFresca,
    ["left", "center", "center", "center", "center"]
  );

  currentY += rowHeight; // linha em branco

  currentY = drawMergedRow("DESPESAS", currentY, totalTableWidth, "left");
  currentY = drawHeaderRow(["Descrição", "VALOR"], currentY, twoColWidths, [
    "left",
    "center",
  ]);

  const despRows = despesas.length
    ? despesas.map((item) => [item.descricao, formatNumber(item.valor)])
    : [["-", "0,00"]];

  currentY = drawRows(despRows, currentY, twoColWidths);

  currentY += rowHeight; // linha em branco

  currentY = drawMergedRow("RESUMO", currentY, totalTableWidth, "left");

  const resumoRows = [
    ["Entradas", formatNumber(totalEntradas)],
    ["QTD Total (KG)", formatNumber(totalQuantidade)],
    ["Despesas", formatNumber(totalDespesas)],
    ["SALDO", formatNumber(saldo)],
  ];

  drawRows(resumoRows, currentY, twoColWidths);

  return { doc, mesAtual };
}

// Função para salvar dados
function salvarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;
    const fornecedorInput = document.getElementById("supplierName");

    const dados = {
      fornecedor: fornecedorInput ? fornecedorInput.value : "",
      alunos: [],
      grudeFresca: [],
      despesas: [],
    };

    // Salvar dados dos alunos
    const nomes = document.getElementsByName("alunoNome[]");
    const quantidades = document.getElementsByName("alunoQtd[]");
    const valores = document.getElementsByName("alunoValor[]");
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        dados.alunos.push({
          nome: nomes[i].value,
          qtd: quantidades[i].value,
          valor: valores[i].value,
        });
      }
    }

    // Salvar dados de grude fresca
    const grudeFrescaNome = document.getElementsByName("grudeFrescaNome[]");
    const grudeFrescaKg = document.getElementsByName("grudeFrescaKg[]");
    const grudeFrescaKgMetade = document.getElementsByName(
      "grudeFrescaKgMetade[]"
    );
    const grudeFrescaValor = document.getElementsByName("grudeFrescaValor[]");

    for (let i = 0; i < grudeFrescaNome.length; i++) {
      if (
        grudeFrescaNome[i].value ||
        grudeFrescaKg[i].value ||
        grudeFrescaValor[i].value
      ) {
        dados.grudeFresca.push({
          nome: grudeFrescaNome[i].value,
          kg: grudeFrescaKg[i].value,
          kgMetade: grudeFrescaKgMetade[i].value,
          valor: grudeFrescaValor[i].value,
        });
      }
    }

    // Salvar dados das despesas
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        dados.despesas.push({
          descricao: descricoes[i].value,
          valor: valoresDespesa[i].value,
        });
      }
    }

    localStorage.setItem(chave, JSON.stringify(dados));
    alert("Dados salvos com sucesso!");
    console.log("Dados salvos:", dados);
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    alert("Erro ao salvar dados!");
  }
}

function carregarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;
    const fornecedorInput = document.getElementById("supplierName");

    const dadosSalvos = localStorage.getItem(chave);
    if (!dadosSalvos) {
      console.log("Nenhum dado encontrado para este mês");
      return;
    }

    const dados = JSON.parse(dadosSalvos);

    // Limpar tabelas existentes
    const tabelaAlunos = document.getElementById("tabelaAlunos");
    const tabelaGrudeFresca = document.getElementById("tabelaGrudeFresca");
    const tabelaDespesas = document.getElementById("tabelaDespesas");

    // Manter apenas o cabeçalho das tabelas
    tabelaAlunos.innerHTML = `
            <thead>
              <tr>
                <th>GRUDE SECA</th>
                <th>QTD KG</th>
                <th>VALOR/KG</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
        `;

    tabelaGrudeFresca.innerHTML = `
            <thead>
              <tr>
                <th>GRUDES</th>
                <th>KG</th>
                <th>KG 1/2</th>
                <th>VALOR/KG</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
        `;

    tabelaDespesas.innerHTML = `
            <tr>
                <th>Descrição da Despesa</th>
                <th>Valor (R$)</th>
            <th>Ação</th>
          </tr>
        `;

    if (fornecedorInput) {
      fornecedorInput.value = dados.fornecedor || fornecedorInput.value || "";
    }

    // Carregar alunos
    dados.alunos.forEach((aluno) => {
      const novaLinha = tabelaAlunos.querySelector("tbody").insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="alunoNome[]" value="${
                  aluno.nome
                }" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="alunoQtd[]" value="${
                  aluno.qtd || ""
                }" step="0.01" min="0" oninput="calcularTotais()" /></td>
                <td><input type="number" name="alunoValor[]" value="${
                  aluno.valor
                }" step="0.01" min="0" oninput="calcularTotais()" /></td>
                <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
            `;
    });

    // Carregar grude fresca
    const grudesFrescaSalvos = dados.grudeFresca || [];
    grudesFrescaSalvos.forEach((grude) => {
      const novaLinha = tabelaGrudeFresca.querySelector("tbody").insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="grudeFrescaNome[]" value="${
                  grude.nome || ""
                }" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="grudeFrescaKg[]" value="${
                  grude.kg || ""
                }" step="0.01" min="0" oninput="atualizarMetade(this)" /></td>
                <td><input type="number" name="grudeFrescaKgMetade[]" value="${
                  grude.kgMetade || ""
                }" step="0.01" min="0" readonly /></td>
                <td><input type="number" name="grudeFrescaValor[]" value="${
                  grude.valor || ""
                }" step="0.01" min="0" oninput="calcularTotais()" /></td>
                <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
            `;
    });

    // Garante uma linha vazia para novos lançamentos se não existir grude fresca salvo
    if (!grudesFrescaSalvos.length) {
      adicionarGrudeFresca();
    }

    // Carregar despesas
    dados.despesas.forEach((despesa) => {
      const novaLinha = tabelaDespesas.insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="despesaDescricao[]" value="${despesa.descricao}" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="despesaValor[]" value="${despesa.valor}" step="0.01" min="0" oninput="calcularTotais()" /></td>
                <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
            `;
    });

    calcularTotais();
    console.log("Dados carregados:", dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados!");
  }
}

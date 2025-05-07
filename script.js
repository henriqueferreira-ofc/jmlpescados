console.log("Carregando JavaScript...");

document.addEventListener("DOMContentLoaded", function () {
  console.log("Página carregada");
  updateMonth();
  carregarDados(); // Carregar dados salvos
  calcularTotais();
});

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
    "Dezembro"
  ];
  const currentDate = new Date();
  document.getElementById("currentMonth").textContent =
    months[currentDate.getMonth()];
}

function excluirLinha(button) {
  const row = button.parentNode.parentNode;
  const table = row.parentNode;

  // Não permite excluir se for a única linha da tabela
  if (table.rows.length > 2) {
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
        maximumFractionDigits: 2
      });

    document.getElementById("totalQuantidade").textContent =
      totalQuantidade.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    document.getElementById("totalDespesas").textContent =
      totalDespesas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    document.getElementById("totalReceita").textContent =
      totalReceita.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    console.log("Totais atualizados:", {
      totalEntradas,
      totalDespesas,
      totalReceita,
      totalQuantidade
    });
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
  }
}

function exportToExcel() {
  try {
    const workbook = XLSX.utils.book_new();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Coletar dados dos grudes e despesas
    const nomes = document.getElementsByName("alunoNome[]");
    const quantidades = document.getElementsByName("alunoQtd[]");
    const valores = document.getElementsByName("alunoValor[]");
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    // Montar linhas conforme o modelo
    const data = [];

    // Cabeçalho vazio para o título
    data.push([null, null, null, null]);
    // Título mesclado
    data.push([
      `JML-PESCADOS - BALANCETE - MÊS DE ${mesAtual}`,
      null,
      null,
      null
    ]);
    // Cabeçalho das colunas em caixa alta
    data.push(["GRUDES", "QUANTIDADE (KG)", "VALOR POR KG", "TOTAL"]);

    let totalEntradas = 0;
    let totalQuantidade = 0;
    let totalDespesas = 0;

    // Adicionar dados dos grudes
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        const quantidade = parseFloat(quantidades[i].value || 0);
        const valorPorKg = parseFloat(valores[i].value || 0);
        const total = quantidade * valorPorKg;

        data.push([nomes[i].value, quantidade, valorPorKg, total]);

        totalEntradas += total;
        totalQuantidade += quantidade;
      }
    }

    // Linha em branco
    data.push([null, null, null, null]);

    // Cabeçalho das despesas
    data.push(["DESPESAS", null, null, null]);
    data.push(["Descrição", "Valor", null, null]);

    // Adicionar dados das despesas
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        const valor = parseFloat(valoresDespesa[i].value || 0);
        data.push([descricoes[i].value, valor, null, null]);
        totalDespesas += valor;
      }
    }

    // Linha em branco
    data.push([null, null, null, null]);

    // Totais
    data.push(["RESUMO", null, null, null]);
    data.push(["Entradas", totalEntradas, null, null]);
    data.push(["Quantidade Total (KG)", totalQuantidade, null, null]);
    data.push(["Despesas", totalDespesas, null, null]);
    data.push(["Saldo", totalEntradas - totalDespesas, null, null]);

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Mesclar células para o título
    ws["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Título
      {
        s: { r: data.findIndex((row) => row[0] === "RESUMO"), c: 0 },
        e: { r: data.findIndex((row) => row[0] === "RESUMO"), c: 3 }
      } // RESUMO
    ];

    // Configurar largura das colunas
    ws["!cols"] = [
      { wch: 30 }, // Coluna A - GRUDES/Descrição
      { wch: 15 }, // Coluna B - Valores
      { wch: 15 }, // Coluna C - Valores
      { wch: 15 } // Coluna D - Valores
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

function gerarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Configurações
    doc.setFont("helvetica");
    doc.setFontSize(16);

    // Título em negrito
    doc.setFont("helvetica", "bold");
    doc.text(
      `JML-PESCADOS - BALANCETE - MÊS DE ${mesAtual.toUpperCase()}`,
      105,
      20,
      {
        align: "center"
      }
    );
    doc.setFont("helvetica", "normal");

    let y = 40;

    // Lista de Grudes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("GRUDES E VALORES:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    const nomes = document.getElementsByName("alunoNome[]");
    const quantidades = document.getElementsByName("alunoQtd[]");
    const valores = document.getElementsByName("alunoValor[]");

    doc.setFontSize(12);
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        const quantidade = quantidades[i].value || "0.00";
        const valor = valores[i].value || "0.00";
        const valorTotal = (parseFloat(quantidade) * parseFloat(valor)).toFixed(
          2
        );

        doc.text(`${nomes[i].value}:`, 30, y);
        y += 8;
        doc.text(`Quantidade: ${quantidade} kg`, 40, y);
        y += 8;
        doc.text(`Valor por kg: R$ ${valor}`, 40, y);
        y += 8;
        doc.text(`Total: R$ ${valorTotal}`, 40, y);
        y += 12;
      }
    }

    // Lista de Despesas
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DESPESAS:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    doc.setFontSize(12);
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        doc.text(
          `${descricoes[i].value}: R$ ${valoresDespesa[i].value || "0.00"}`,
          30,
          y
        );
        y += 8;
      }
    }

    // Totais
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RESUMO:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    // Formatar valores com separador de milhar
    const totalEntradas = document.getElementById("totalEntradas").textContent;
    const totalQuantidade =
      document.getElementById("totalQuantidade").textContent;
    const totalDespesas = document.getElementById("totalDespesas").textContent;
    const totalReceita = document.getElementById("totalReceita").textContent;

    doc.text(`Entradas: R$ ${totalEntradas}`, 30, y);
    y += 8;
    doc.text(`Quantidade Total: ${totalQuantidade} kg`, 30, y);
    y += 8;
    doc.text(`Despesas: R$ ${totalDespesas}`, 30, y);
    y += 8;
    doc.text(`Saldo: R$ ${totalReceita}`, 30, y);

    // Salvar PDF
    doc.save(`balancete_${mesAtual.toLowerCase()}.pdf`);

    console.log("PDF gerado com sucesso");
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro ao gerar PDF!");
  }
}

// Função para salvar dados
function salvarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;

    const dados = {
      alunos: [],
      despesas: []
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
          valor: valores[i].value
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
          valor: valoresDespesa[i].value
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

    const dadosSalvos = localStorage.getItem(chave);
    if (!dadosSalvos) {
      console.log("Nenhum dado encontrado para este mês");
      return;
    }

    const dados = JSON.parse(dadosSalvos);

    // Limpar tabelas existentes
    const tabelaAlunos = document.getElementById("tabelaAlunos");
    const tabelaDespesas = document.getElementById("tabelaDespesas");

    // Manter apenas o cabeçalho das tabelas
    tabelaAlunos.innerHTML = `
            <thead>
              <tr>
                <th>GRUDES</th>
                <th>QTD KG</th>
                <th>VALOR KG</th>
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

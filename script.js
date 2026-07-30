const titulo = document.getElementById("titulo");
const nota = document.getElementById("nota");
const resenha = document.getElementById("resenha");
const botaoSalvar = document.getElementById("salvar");
const listaLivros = document.getElementById("listaLivros");
const botaoPDF = document.getElementById("pdf");
const botaocorrigir = document.getElementById("corrigir");


// ===== VARIÁVEIS =====
let livros = JSON.parse(localStorage.getItem("livros")) || [];
let editando = null;

// Mostrar livros ao abrir
mostrarLivros();

// Evento do botão
botaoSalvar.addEventListener("click", salvarLivro);
botaoPDF.addEventListener("click", gerarPDF);

// =======================
// SALVAR LIVRO
// =======================
function salvarLivro() {

    if (titulo.value.trim() === "" || resenha.value.trim() === "") {
        alert("Preencha o nome do livro e a resenha.");
        return;
    }

    salvar(""); // salva o livro sem capa
}

// =======================
// SALVAR NO ARRAY
// =======================
function salvar(capa) {

    const livro = {
        titulo: titulo.value,
        imagem: capa,
        nota: nota.value,
        resenha: resenha.value
    };

    if (editando === null) {

        livros.push(livro);

    } else {

        livros[editando] = livro;
        editando = null;
        botaoSalvar.textContent = "💾 Salvar";

    }

    localStorage.setItem("livros", JSON.stringify(livros));

    limparCampos();

    mostrarLivros();

}

// =======================
// MOSTRAR LIVROS
// =======================
function mostrarLivros() {

    listaLivros.innerHTML = "";

    livros.forEach((livro, indice) => {

        const card = document.createElement("div");

        card.className = "livro";

        card.innerHTML = `
            ${livro.imagem ? '<img src="${livro.imagem}" class="capa">' : ""}

            <h3>${livro.titulo}</h3>

            <p class="estrelas">${livro.nota}</p>

            <p>${livro.resenha}</p>

            <button onclick="editarLivro(${indice})">
                ✏️ Editar
            </button>

            <button onclick="excluirLivro(${indice})">
                🗑️ Excluir
            </button>
        `;

        listaLivros.appendChild(card);

    });

}

// =======================
// EDITAR
// =======================
function editarLivro(indice) {

    const livro = livros[indice];

    titulo.value = livro.titulo;
    nota.value = livro.nota;
    resenha.value = livro.resenha;

    editando = indice;

    botaoSalvar.textContent = "Atualizar";

}

// =======================
// EXCLUIR
// =======================
function excluirLivro(indice) {

    if (!confirm("Deseja excluir este livro?")) {
        return;
    }

    livros.splice(indice, 1);

    localStorage.setItem("livros", JSON.stringify(livros));

    mostrarLivros();

}

// =======================
// LIMPAR CAMPOS
// =======================
function limparCampos() {

    titulo.value = "";
    nota.selectedIndex = 0;
    resenha.value = "";

}

async function gerarPDF() {

    if (livros.length === 0) {
        alert("Nenhum livro salvo.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let y = 20;

    pdf.setFontSize(20);
    pdf.text("Diário de Leitura", 20, y);

    y += 15;

    livros.forEach((livro) => {

        pdf.setFontSize(16);
        pdf.text("Livro: " + livro.titulo, 20, y);

        y += 8;

        pdf.setFontSize(12);
        pdf.text("Nota: " + livro.nota, 20, y);

        y += 8;

        const texto = pdf.splitTextToSize(
            livro.resenha,
            170
        );

        pdf.text(texto, 20, y);

        y += texto.length * 7 + 10;

        if (y > 260) {
            pdf.addPage();
            y = 20;
        }

    });

    pdf.save("Diario_de_Leitura.pdf");

}

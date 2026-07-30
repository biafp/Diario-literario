const titulo = document.getElementById("titulo");
const imagem = document.getElementById("imagem");
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
botaocorrigir.addEventListener("click", corrigirtexto);

// =======================
// SALVAR LIVRO
// =======================
function salvarLivro() {

    if (titulo.value.trim() === "" || resenha.value.trim() === "") {
        alert("Preencha o nome do livro e a resenha.");
        return;
    }

    const arquivo = imagem.files[0];

    if (arquivo) {

        const leitor = new FileReader();

        leitor.onload = function () {
            salvar(leitor.result);
        };

        leitor.readAsDataURL(arquivo);

    } else {

        let capa = "";

        if (editando !== null) {
            capa = livros[editando].imagem;
        }

        salvar(capa);

    }

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
    imagem.value = "";
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
async function corrigirTexto() {

    const texto = document.getElementById("resenha").value;
    const resultado = document.getElementById("resultadoCorrecao");

    if(texto.trim() === ""){
        resultado.innerHTML = "Digite um texto primeiro.";
        return;
    }

    resultado.innerHTML = "Corrigindo... ✨";


    const API_KEY = "AQ.Ab8RN6I5b_sUvFKyDHadjtYwgwcTbl-Wtb0c_vAL1cqYM7dtcA";


    try {

        const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                contents:[
                    {
                        parts:[
                            {
                                text:
                                `Corrija o texto abaixo mantendo o estilo original.
                                Corrija ortografia, pontuação e gramática.
                                Não mude o sentido.

                                Texto:
                                ${texto}`
                            }
                        ]
                    }
                ]

            })
        });


        const dados = await resposta.json();

        console.log(JSON.stringify(dados, null, 2));


        const correcao =
        dados.candidates[0].content.parts[0].text;


        resultado.innerHTML = `
        <h3>Texto corrigido:</h3>
        <p>${correcao}</p>
        `;


    } catch(error){

        resultado.innerHTML =
        "Erro ao corrigir texto 😢";

        console.log(error);

    }

}
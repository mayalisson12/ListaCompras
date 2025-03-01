document.addEventListener("DOMContentLoaded", carregarLista);

function adicionarItem() {
    const itemInput = document.getElementById("item");
    const precoInput = document.getElementById("preco");
    const lista = document.getElementById("lista");
    let itemNome = itemInput.value.trim();

    if (!itemNome) return;

    itemNome = itemNome.charAt(0).toUpperCase() + itemNome.slice(1).toLowerCase();

    const itensExistentes = document.querySelectorAll(".item-text");
    for (let item of itensExistentes) {
        if (item.textContent.toLowerCase() === itemNome.toLowerCase()) {
            exibirAlerta("Este item já está na lista!", "error");
            return;
        }
    }

    const li = document.createElement("li");
    li.innerHTML = `
        <span class='item-text' onclick='editarItem(this)'>${itemNome}</span>
        <input type='text' class='item-input' value='${itemNome}' onblur='salvarEdicao(this)'>
        <span class='preco-text' onclick='editarPreco(this)'>R$ 0.00</span>
        <input type='number' class='preco-input' placeholder='Preço' inputmode='numeric' onblur='salvarPreco(this)' oninput='atualizarTotal()'>
        <div class='remover-container'>
            <button class='remover' onclick='confirmarRemocao(this)'>X</button>
        </div>
    `;
    lista.appendChild(li);

    itemInput.value = "";
    exibirAlerta("Item adicionado com sucesso!", "success");
    atualizarTotal();
    salvarLista();

    precoInput.focus();
}

function editarItem(element) {
    const input = element.nextElementSibling;
    element.style.display = "none";
    input.style.display = "block";
    input.focus();
}

function salvarEdicao(input) {
    const text = input.previousElementSibling;
    text.textContent = input.value;
    input.style.display = "none";
    text.style.display = "block";
    salvarLista();
}

function editarPreco(element) {
    const input = element.nextElementSibling;
    element.style.display = "none";
    input.style.display = "block";
    input.focus();
}

function salvarPreco(input) {
    const text = input.previousElementSibling;
    let valor = parseFloat(input.value) || 0;
    text.textContent = `R$ ${valor.toFixed(2)}`;
    input.style.display = "none";
    text.style.display = "block";
    atualizarTotal();
    salvarLista();
}

function atualizarTotal() {
    let total = 0;
    document.querySelectorAll(".preco-text").forEach(span => {
        const valor = parseFloat(span.textContent.replace("R$ ", "")) || 0;
        total += valor;
    });
    document.getElementById("totalComMarcado").textContent = `R$ ${total.toFixed(2)}`;
}

function confirmarRemocao(botao) {
    const confirmacao = document.getElementById("popupDeleteConfirmation");
    const itemNome = botao.closest("li").querySelector(".item-text").textContent; // Pega o nome do item
    confirmacao.style.display = "block";
    
    // Altera o texto da mensagem para incluir o nome do item
    confirmacao.querySelector(".mensagem").textContent = `Tem certeza que deseja excluir o item "${itemNome}"?`;
    
    confirmacao.dataset.itemParaRemover = botao.closest("li").outerHTML;
}

function removerItemConfirmado() {
    const confirmacao = document.getElementById("popupDeleteConfirmation");
    const itemParaRemover = confirmacao.dataset.itemParaRemover;
    confirmacao.style.display = "none";
    
    document.querySelectorAll("#lista li").forEach(li => {
        if (li.outerHTML === itemParaRemover) {
            li.remove();
        }
    });
    
    atualizarTotal();
    salvarLista();
    exibirAlerta("Item excluído com sucesso!", "error");
}

function fecharPopup() {
    document.getElementById("popupDeleteConfirmation").style.display = "none";
}

function exibirAlerta(mensagem, tipo) {
    const alerta = tipo === "success" ? document.getElementById("successAlert") : document.getElementById("customAlert");
    alerta.textContent = mensagem;
    alerta.className = `alert ${tipo}`;
    alerta.style.display = "block";
    alerta.style.animation = "slideIn 0.5s ease-out";
    
    setTimeout(() => {
        alerta.style.animation = "slideOut 0.5s ease-out";
        setTimeout(() => {
            alerta.style.display = "none";
        }, 500);
    }, 3000);
}

function salvarLista() {
    const itens = [];
    document.querySelectorAll("#lista li").forEach(li => {
        const nome = li.querySelector(".item-text").textContent;
        const preco = li.querySelector(".preco-text").textContent.replace("R$ ", "");
        itens.push({ nome, preco });
    });
    localStorage.setItem("listaCompras", JSON.stringify(itens));
}

function carregarLista() {
    const listaSalva = localStorage.getItem("listaCompras");
    if (!listaSalva) return;

    const lista = document.getElementById("lista");
    const itens = JSON.parse(listaSalva);

    itens.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class='item-text' onclick='editarItem(this)'>${item.nome}</span>
            <input type='text' class='item-input' value='${item.nome}' onblur='salvarEdicao(this)'>
            <span class='preco-text' onclick='editarPreco(this)'>R$ ${parseFloat(item.preco).toFixed(2)}</span>
            <input type='number' class='preco-input' placeholder='Preço' value='${item.preco}' inputmode='numeric' onblur='salvarPreco(this)' oninput='atualizarTotal()'>
            <div class='remover-container'>
                <button class='remover' onclick='confirmarRemocao(this)'>X</button>
            </div>
        `;
        lista.appendChild(li);
    });

    atualizarTotal();
}

function enviarWhatsApp() {
    let listaDeCompras = "Olá, minha lista de compras:\n\n";
    let total = 0;

    document.querySelectorAll("#lista li").forEach(li => {
        const nome = li.querySelector(".item-text").textContent;
        const preco = parseFloat(li.querySelector(".preco-text").textContent.replace("R$ ", "")) || 0;
        listaDeCompras += `${nome}: R$ ${preco.toFixed(2)}\n`;
        total += preco;
    });

    listaDeCompras += `\nTotal: R$ ${total.toFixed(2)}\n\nA lista está completa!`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(listaDeCompras)}`;
    window.open(url, "_blank");
}

// Previne o zoom ao focar nos campos de input
document.querySelectorAll('input, textarea').forEach(function(element) {
    element.addEventListener('focus', function() {
        document.body.style.zoom = '100%';  // Ajusta o zoom para 100% ao focar no input
    });

    element.addEventListener('blur', function() {
        setTimeout(function() {
            document.body.style.zoom = '100%';  // Restaura o zoom original quando o teclado é fechado
        }, 100); // Delay para garantir que o teclado tenha fechado
    });
});

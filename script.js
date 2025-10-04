document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. VARIÁVEIS GLOBAIS E FUNÇÕES DE UTILIDADE
    // ----------------------------------------------------------------------
    const STORAGE_KEY = 'pipoCarrinho';
    const contadorElemento = document.getElementById('carrinho-contador');

    // Funções para manipular o armazenamento local (localStorage)
    function getCarrinho() {
        const carrinhoJSON = localStorage.getItem(STORAGE_KEY);
        // Retorna o array de carrinho ou um array vazio se não houver dados
        return carrinhoJSON ? JSON.parse(carrinhoJSON) : [];
    }

    function saveCarrinho(carrinho) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
    }

    // Funções para formatar e exibir valores
    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Função para atualizar a contagem no Navbar
    function atualizarContador() {
        const carrinho = getCarrinho();
        // Soma a quantidade de todos os itens
        const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

        if (contadorElemento) {
            contadorElemento.textContent = totalItens;
            // Mostra ou esconde o badge: total > 0 (opacidade 1), total == 0 (opacidade 0.5 para não sumir totalmente)
            contadorElemento.style.opacity = totalItens > 0 ? '1' : '0.5';
        }
    }

    // Função que adiciona o item ao carrinho
    function adicionarAoCarrinho(novoProduto) {
        let carrinho = getCarrinho();
        // Verifica se o produto já está no carrinho
        const produtoExistente = carrinho.find(item => item.titulo === novoProduto.titulo);

        if (produtoExistente) {
            produtoExistente.quantidade++;
        } else {
            // Adiciona novo item
            carrinho.push({
                ...novoProduto,
                id: Date.now(), // Usa timestamp como ID único para cada item
                quantidade: 1
            });
        }

        saveCarrinho(carrinho);
        atualizarContador();
    }

    // ----------------------------------------------------------------------
    // 2. LÓGICA DO CARDÁPIO (ADICIONAR)
    // ----------------------------------------------------------------------

    const isCardapioPage = document.querySelector('#cardapio-completo');

    if (isCardapioPage) {
        const botoesAdicionar = document.querySelectorAll('.btn-carrinho');

        botoesAdicionar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // 1. Obter dados do produto diretamente dos atributos do botão
                const titulo = btn.getAttribute('data-titulo');
                const preco = parseFloat(btn.getAttribute('data-preco'));
                const imagemSrc = btn.getAttribute('data-img');

                // Se os dados estiverem completos, adiciona ao carrinho
                if (titulo && preco && imagemSrc) {
                    adicionarAoCarrinho({ titulo, preco, imagemSrc });
                } else {
                    console.error("Erro: Dados do produto incompletos. Verifique o HTML do cardápio.");
                    return;
                }

                // 2. Feedback visual
                const textoOriginal = btn.textContent;
                btn.textContent = "Adicionado!";
                btn.style.backgroundColor = 'green';

                setTimeout(() => {
                    btn.textContent = textoOriginal;
                    // Retorna à cor original definida no CSS
                    btn.style.backgroundColor = 'var(--cor-apoio)'; 
                }, 800);
            });
        });
    }


    // ----------------------------------------------------------------------
    // 3. LÓGICA DO CARRINHO (RENDERIZAÇÃO, QUANTIDADE, TOTAIS, FRETE)
    // ----------------------------------------------------------------------

    const carrinhoContainer = document.querySelector('.itens-do-carrinho-container');
    const isCarrinhoPage = document.querySelector('#carrinho-de-compras');

    // Função principal de renderização do carrinho
    function renderizarCarrinho() {
        let carrinho = getCarrinho();
        carrinhoContainer.innerHTML = ''; // Limpa o conteúdo

        const areaFrete = document.querySelector('.area-calculo-frete');
        const resumoPedido = document.querySelector('.resumo-pedido');
        const ctaContainer = document.querySelector('.cta-carrinho-container');

        if (carrinho.length === 0) {
            // Exibe mensagem de carrinho vazio
            carrinhoContainer.innerHTML = `
                <p class="carrinho-vazio-mensagem">
                    Seu carrinho está vazio. Visite nosso <a href="cardapio.html">Cardápio Completo</a> para começar a montar seu pedido!
                </p>
            `;
            // Esconde todas as áreas de total e frete
            if (areaFrete) areaFrete.style.display = 'none';
            if (resumoPedido) resumoPedido.style.display = 'none';
            if (ctaContainer) ctaContainer.style.display = 'none';

        } else {
            // Mostra áreas de resumo e frete
            if (areaFrete) areaFrete.style.display = 'block';
            if (resumoPedido) resumoPedido.style.display = 'block';
            // Usa 'flex' como definido no CSS
            if (ctaContainer) ctaContainer.style.display = 'flex'; 

            carrinho.forEach(item => {
                const subtotal = item.preco * item.quantidade;
                const itemHTML = `
                    <div class="item-carrinho" data-produto-id="${item.id}">
                        <img src="${item.imagemSrc}" alt="${item.titulo}" class="imagem-carrinho">
                        <div class="info-carrinho">
                            <strong>${item.titulo}</strong>
                            <span class="preco-unitario" data-preco="${item.preco}">${formatarMoeda(item.preco)} (un.)</span>
                        </div>
                        
                        <div class="quantidade-controle">
                            <button class="btn-qty" data-acao="remover">-</button>
                            <input type="number" value="${item.quantidade}" min="1" class="campo-quantidade" disabled>
                            <button class="btn-qty" data-acao="adicionar">+</button>
                        </div>
                        
                        <div class="subtotal-item">
                            <span class="subtotal-valor">${formatarMoeda(subtotal)}</span>
                            <button class="btn-remover-item">X</button>
                        </div>
                    </div>
                `;
                carrinhoContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        calcularTotal();
        atualizarContador();
    }
    
    // Altera a quantidade de um item no array do carrinho
    function alterarQuantidade(produtoId, acao) {
        let carrinho = getCarrinho();
        // Converte o ID para número (se o ID for baseado em Date.now(), ele é numérico)
        const itemIndex = carrinho.findIndex(item => item.id === produtoId);

        if (itemIndex > -1) {
            if (acao === 'adicionar') {
                carrinho[itemIndex].quantidade++;
            } else if (acao === 'remover') {
                if (carrinho[itemIndex].quantidade > 1) {
                    carrinho[itemIndex].quantidade--;
                } else {
                    // Se a quantidade for 1 e tentar remover, chama a função de remover item
                    // Retorna para evitar a chamada duplicada de saveCarrinho/renderizarCarrinho
                    return removerItem(produtoId); 
                }
            }
            saveCarrinho(carrinho);
            renderizarCarrinho(); // Recarrega a UI para refletir as mudanças
        }
    }

    // Remove um item do array do carrinho
    function removerItem(produtoId) {
        let carrinho = getCarrinho();
        // Filtra para manter apenas os itens que NÃO possuem o ID do produto a ser removido
        carrinho = carrinho.filter(item => item.id !== produtoId);

        // Reseta o frete se o carrinho ficar vazio 
        if (carrinho.length === 0) {
            localStorage.removeItem('freteValor');
        }

        saveCarrinho(carrinho);
        renderizarCarrinho(); // Recarrega a UI
    }

    // Calcula o Subtotal, Frete e Total Final
    function calcularTotal() {
        const carrinho = getCarrinho();
        // Calcula o subtotal de todos os itens
        const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // Busca o valor do frete (simulado) salvo
        const frete = parseFloat(localStorage.getItem('freteValor') || 0);

        const totalFinal = subtotal + frete;

        // Atualiza a UI se os elementos existirem
        if (document.getElementById('subtotal-display')) {
            document.getElementById('subtotal-display').textContent = formatarMoeda(subtotal);
            document.getElementById('frete-display').textContent = formatarMoeda(frete);
            document.getElementById('total-final-display').textContent = formatarMoeda(totalFinal);
        }
        
        // Atualiza o display de frete na área de cálculo
        const freteDisplay = document.getElementById('frete-valor-display');
        if (freteDisplay) {
            freteDisplay.textContent = frete > 0 ? `Frete: ${formatarMoeda(frete)}` : 'Frete: Grátis / Não calculado';
        }
    }

    // Lógica de Cálculo de Frete (mantida como você escreveu)
    function calcularFrete() {
        const carrinho = getCarrinho();
        if (carrinho.length === 0) {
            alert('Adicione itens ao carrinho antes de calcular o frete.');
            return;
        }

        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        let valorFrete = 0;
        
        // Calcula o subtotal do pedido (necessário para o frete grátis)
        const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        
        // --- LÓGICA DE FRETE ---

        if (cep.length === 8) {
            let distanciaSimuladaKm = 0;
            let isMogiDasCruzes = false;

            // SIMULAÇÃO: Definindo a distância e a região com base no CEP
            if (cep.startsWith('087')) {
                // CEPs simulados em Mogi das Cruzes (distância curta/média)
                isMogiDasCruzes = true;
                distanciaSimuladaKm = 4.5; // Ex: dentro do raio de 5km
            } else if (cep.startsWith('01') || cep.startsWith('05')) {
                // CEPs simulados fora de Mogi (distância longa)
                distanciaSimuladaKm = 10;
            } else {
                // Outras regiões (distância média)
                distanciaSimuladaKm = 7;
            }

            // 1. Aplica a Regra de Frete Grátis para Mogi (> R$ 70,00)
            if (isMogiDasCruzes && subtotal >= 70.00) {
                valorFrete = 0;
                alert(`🎉 Frete Grátis! Seu pedido é acima de ${formatarMoeda(70)} (Região de Mogi das Cruzes simulada).`);

            } else {
                // 2. Aplica a Regra de Frete por Distância
                const taxaFixa = 3.00;
                const raioMaximoFixo = 5;
                const custoPorKmAdicional = 1.00;

                if (distanciaSimuladaKm <= raioMaximoFixo) {
                    // Até 5km (Simulados): Frete Fixo
                    valorFrete = taxaFixa;
                } else {
                    // Acima de 5km: R$ 3,00 + R$ 1,00 por Km adicional
                    const kmAdicional = distanciaSimuladaKm - raioMaximoFixo;
                    valorFrete = taxaFixa + (kmAdicional * custoPorKmAdicional);
                }
                
                // Arredonda o frete para duas casas decimais
                valorFrete = parseFloat(valorFrete.toFixed(2));
                alert(`Frete simulado calculado em ${formatarMoeda(valorFrete)} (Distância simulada: ${distanciaSimuladaKm} km).`);
            }

        } else {
            // Se o CEP for inválido, o frete é 0 (e não é salvo)
            localStorage.setItem('freteValor', 0);
            document.getElementById('frete-valor-display').textContent = 'Frete: R$ 0,00';
            alert('Por favor, insira um CEP válido de 8 dígitos para calcular o frete.');
            calcularTotal();
            return;
        }
        
        // Salva o frete e atualiza a UI
        localStorage.setItem('freteValor', valorFrete.toFixed(2));
        calcularTotal();
    }
    
    // ----------------------------------------------------------------------
    // 4. LÓGICA DA NAVBAR (MOBILE)
    // ----------------------------------------------------------------------
    const menuHamburguer = document.querySelector('.menu-hamburguer');
    const navMenu = document.querySelector('.main-nav');
    
    if (menuHamburguer && navMenu) {
        menuHamburguer.addEventListener('click', () => {
            // Adiciona/Remove a classe 'aberto' para mostrar/esconder o menu
            navMenu.classList.toggle('aberto');
            
            // Adiciona/Remove atributo ARIA para acessibilidade
            const isAberto = navMenu.classList.contains('aberto');
            menuHamburguer.setAttribute('aria-expanded', isAberto);
        });
    }

    // ----------------------------------------------------------------------
    // 5. LÓGICA DE FINALIZAÇÃO DO PEDIDO (UX)
    // ----------------------------------------------------------------------
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');

    if (btnFinalizarCompra && isCarrinhoPage) {
        btnFinalizarCompra.addEventListener('click', (e) => {
            e.preventDefault();

            const carrinho = getCarrinho();
            const frete = parseFloat(localStorage.getItem('freteValor') || 0);

            if (carrinho.length === 0) {
                alert('Seu carrinho está vazio. Adicione itens antes de finalizar.');
                return;
            }

            // Opcional: Verifica se o frete foi calculado (garante que o CEP foi inserido)
            if (frete === 0 && document.getElementById('cep')?.value.length !== 8) {
                alert('Por favor, insira e calcule o frete antes de finalizar o pedido.');
                return;
            }

            const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0) + frete;
            
            // SIMULAÇÃO DA FINALIZAÇÃO
            alert(`✅ Pedido Finalizado com Sucesso! \nTotal a pagar: ${formatarMoeda(total)}. \nEm breve enviaremos as instruções de pagamento.`);

            // Limpa o carrinho e redireciona (ou atualiza a tela)
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('freteValor');
            
            // Recarrega a página para refletir o carrinho vazio
            renderizarCarrinho(); 
            // Opcional: window.location.href = 'index.html'; // Redireciona para a página inicial
        });
    }


    // ----------------------------------------------------------------------
    // INICIALIZAÇÃO
    // ----------------------------------------------------------------------
    atualizarContador();
    if (isCarrinhoPage) {
        // Event Delegation: Escuta cliques em +,- e X no container principal
        carrinhoContainer.addEventListener('click', (e) => {
            const target = e.target;

            // Botão de Adicionar/Remover Quantidade (+/-)
            if (target.classList.contains('btn-qty')) {
                const acao = target.getAttribute('data-acao'); // 'adicionar' ou 'remover'
                // Usa target.closest para subir até o item pai e pegar o ID
                const itemCarrinho = target.closest('.item-carrinho');
                if (itemCarrinho) {
                    // O ID está como string no HTML, precisamos converter de volta para número
                    const produtoId = parseInt(itemCarrinho.getAttribute('data-produto-id')); 
                    alterarQuantidade(produtoId, acao);
                }
            }

            // Botão de Remover Item (X)
            if (target.classList.contains('btn-remover-item')) {
                 const itemCarrinho = target.closest('.item-carrinho');
                 if (itemCarrinho) {
                    const produtoId = parseInt(itemCarrinho.getAttribute('data-produto-id'));
                    removerItem(produtoId);
                 }
            }
        });

        // Listener para o botão de calcular frete
        document.getElementById('btn-calcular-frete')?.addEventListener('click', calcularFrete);
        
        // Renderiza o carrinho apenas na página do carrinho
        renderizarCarrinho();
    }

});
# Otimização de Layout e UX - Padaria do Pipo

## 💡 Problemas Identificados (UX e Contraste)

1. **Baixo Contraste do Botão "Voltar" (Acessibilidade):** O botão estava invisível devido a cores de texto e fundo muito claras, violando princípios de usabilidade.
2. **Duplicação de CTA:** O botão "Continuar Comprando" estava em duplicidade (topo e rodapé), causando confusão.
3. **Estilo de Componente:** Botões de controle de quantidade (`+` e `-`) estavam quadrados, sem alinhamento visual com o restante do site.

## 🛠️ Soluções e Implementação

* **Contraste (CSS):** Apliquei a cor primária Terracota (`var(--cor-principal)`) ao texto e borda do botão, garantindo visibilidade e contraste.
* **Refatoração de UX (HTML):** Removi o botão duplicado no rodapé (`cta-carrinho-container`) e mantive apenas o link **"← Continuar Comprando"** no topo.
* **Design de Componente (CSS):** Adicionei `border-radius: 50%` à classe `.btn-qty` para deixá-los circulares.

## ✅ Resultado

As correções resultaram em uma navegação mais fluida e intuitiva, com todos os elementos visuais coesos e acessíveis.

# Ideias de Design — Infrequência Escolar JF

## Abordagem 1: Institucional Moderno
<response>
<text>
**Design Movement:** Government Digital Service (GDS) — clareza, hierarquia e confiança institucional.

**Core Principles:**
- Clareza funcional: cada elemento serve a um propósito claro e direto
- Hierarquia visual rigorosa: títulos, subtítulos e dados com pesos tipográficos distintos
- Confiança institucional: paleta sóbria com azul profundo como cor primária
- Densidade informacional controlada: cards compactos, tabelas limpas

**Color Philosophy:**
- Azul institucional (#1E40AF / blue-800) como primário — transmite autoridade e seriedade
- Fundo cinza muito claro (#F8FAFC) para reduzir fadiga visual
- Laranja âmbar para alertas/pendentes, verde para resolvidos, azul médio para notificados
- Branco puro para cards com sombra sutil

**Layout Paradigm:**
- Header fixo com logo + navegação horizontal por tabs
- Conteúdo em área central com max-width de 1280px
- Cards de métricas em grid de 5 colunas
- Seção inferior em duas colunas: gráfico à esquerda, lista à direita

**Signature Elements:**
- Badge colorido de status com ícone pequeno
- Linha azul ativa embaixo da tab selecionada
- Ícone circular com fundo colorido suave nos cards de métricas

**Interaction Philosophy:**
- Hover sutil nos itens de lista (fundo levemente cinza)
- Transição suave ao trocar de tab
- Botão primário com efeito de escala no clique

**Animation:**
- Entrada dos cards com fade + translateY(8px) em cascata (stagger 60ms)
- Tabs com transição de underline deslizante
- Hover em linhas da lista: 150ms ease-out

**Typography System:**
- Display: Inter 700/800 para títulos de seção
- Body: Inter 400/500 para dados e labels
- Números de métricas: Inter 700, tamanho grande (2.5rem)
</text>
<probability>0.08</probability>
</response>

## Abordagem 2: Clean Dashboard Profissional
<response>
<text>
**Design Movement:** Material Design 3 adaptado — superfícies elevadas, cores semânticas, tipografia expressiva.

**Core Principles:**
- Superfícies com elevação: cards com sombras em camadas para profundidade
- Cores semânticas consistentes: cada status tem sua cor em todo o sistema
- Tipografia expressiva: fonte display para números grandes, sans-serif para texto
- Interatividade visível: estados hover/active claramente definidos

**Color Philosophy:**
- Azul royal (#2563EB) como primário
- Superfície de fundo #F1F5F9 (slate-100)
- Cards brancos com box-shadow suave
- Verde esmeralda para resolvidos, âmbar para pendentes, azul para notificados, roxo para busca ativa

**Layout Paradigm:**
- Sidebar estreita à esquerda com ícones + labels
- Área principal com header de página + conteúdo
- Grid responsivo para cards de métricas
- Tabela com linhas alternadas para listagem de ocorrências

**Signature Elements:**
- Sidebar com indicador de rota ativa (barra lateral colorida)
- Chips de status com ícone + texto
- Gráfico de rosca com legenda inline

**Interaction Philosophy:**
- Ripple effect nos botões
- Rows de tabela com highlight no hover
- Formulário com labels flutuantes

**Animation:**
- Sidebar: transição de largura ao colapsar
- Cards: scale(1.01) no hover com shadow aumentada
- Formulário: campos com border-color transition

**Typography System:**
- Títulos: Roboto 700
- Corpo: Roboto 400
- Números: Roboto Mono 600 para dados numéricos
</text>
<probability>0.07</probability>
</response>

## Abordagem 3: Governo Digital Brasileiro — Fiel ao Layout Original
<response>
<text>
**Design Movement:** Governo Digital (GOV.BR) + DSGOVBR — interface institucional brasileira, acessível e funcional.

**Core Principles:**
- Fidelidade ao layout da imagem: reproduzir fielmente a estrutura visual fornecida
- Acessibilidade WCAG 2.1 AA: contraste mínimo 4.5:1, foco visível
- Consistência semântica: cores de status padronizadas em todo o sistema
- Densidade equilibrada: informação densa mas legível

**Color Philosophy:**
- Azul primário #1D4ED8 (blue-700) — identidade visual da Secretaria de Educação
- Fundo da página #F3F4F6 (gray-100) — suave, não ofusca o conteúdo
- Cards brancos com borda sutil e sombra leve
- Status: Pendente = âmbar (#F59E0B), Notificado = azul (#3B82F6), Busca Ativa = roxo (#8B5CF6), Resolvido = verde (#10B981), Violação = vermelho (#EF4444)

**Layout Paradigm:**
- Header horizontal com logo IF + título + subtítulo + ícone de logout
- Navegação por tabs horizontais (Painel / Ocorrências / Novo Registro)
- Grid 5 colunas para cards de métricas
- Duas colunas abaixo: gráfico de rosca (40%) + lista de pendentes (60%)

**Signature Elements:**
- Ícone circular com fundo colorido suave para cada métrica
- Badge de status com cor semântica e texto
- Linha azul ativa na tab selecionada

**Interaction Philosophy:**
- Navegação por tabs com estado ativo persistente
- Hover em linhas da lista com fundo levemente cinza
- Botão "Registrar Ocorrência" com ícone + texto

**Animation:**
- Fade-in suave dos cards ao carregar (200ms)
- Hover em itens de lista: background transition 150ms
- Tab ativa: underline deslizante

**Typography System:**
- Fonte: Inter (Google Fonts) — padrão para sistemas gov
- Títulos de seção: Inter 700, 20px
- Labels de cards: Inter 500, 14px
- Números de métricas: Inter 700, 32px
- Corpo/subtítulos: Inter 400, 14px, cor muted
</text>
<probability>0.09</probability>
</response>

---

## Decisão: Abordagem 3 — Governo Digital Brasileiro

Escolhida por ser a mais fiel ao layout fornecido na imagem, com identidade visual institucional adequada para a Secretaria de Educação de JF.

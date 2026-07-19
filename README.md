# Market Manager — Frontend

> Painel de gestão de estoque, vendas e precificação para vendedores de Marketplace.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Execução](#configuração-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Componentes Reutilizáveis](#componentes-reutilizáveis)
- [Cliente de API (`src/lib/api.ts`)](#cliente-de-api)
- [Convenções de Código](#convenções-de-código)

---

## Visão Geral

**Market Manager** é um painel administrativo (_frontend_) construído em Next.js que consome uma API REST externa. A aplicação permite que vendedores de marketplace gerenciem:

- **Dashboard** — KPIs financeiros (receita bruta/líquida, lucro, pedidos), gráfico de receita mensal, breakdown de margem e ranking dos produtos mais vendidos.
- **Produtos** — Cadastro, listagem, edição e exclusão de produtos com cálculo dinâmico de precificação (custo, margem, markup, lucro sugerido). Suporte a upload e remoção de imagem.
- **Vendas** — Registro, edição e exclusão de transações com suporte a múltiplos métodos de pagamento e status (Concluída, Pendente, Perda, Devolvida). O backend recalcula o estoque automaticamente.
- **Categorias** — CRUD de categorias com cor personalizada (hex) e contagem de produtos associados.
- **Relatórios** — Módulo de relatórios (em desenvolvimento).

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) |
| UI | React 19 |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v4 |
| Gráficos | [Chart.js 4](https://www.chartjs.org/) |
| Ícones | Material Symbols (Google Fonts) |
| Linting | ESLint 9 |

---

## Pré-requisitos

- **Node.js** ≥ 18
- **Backend** rodando em `http://127.0.0.1:3333` (veja a seção de API abaixo)
- Um token de autenticação válido (obtido via login na rota `/` da aplicação)

---

## Configuração e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo (já existe um arquivo de exemplo no repositório):

```env
# URL base da API — não altere em desenvolvimento local
NEXT_PUBLIC_API_URL=http://127.0.0.1:3333/api/v1
```

> **Nota:** A URL base da API atualmente está definida diretamente em `src/lib/api.ts`. Caso queira torná-la configurável, extraia a constante `BASE_URL` para uma variável de ambiente.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Outros scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o bundle de produção |
| `npm run start` | Inicia o servidor em modo produção (requer build) |
| `npm run lint` | Executa o ESLint |

---

## Estrutura do Projeto

```
.
├── app/
│   ├── globals.css          # Estilos globais e tokens CSS
│   ├── layout.tsx           # Layout raiz (fonte, meta tags)
│   ├── page.tsx             # Tela de login (rota raiz "/")
│   └── (panel)/             # Route group — painel autenticado
│       ├── layout.tsx       # Shell do painel (SideNav + TopBar)
│       ├── dashboard/
│       │   └── page.tsx     # Dashboard com KPIs e gráficos
│       ├── products/
│       │   ├── page.tsx     # Listagem e gestão de produtos
│       │   └── register/
│       │       └── page.tsx # Formulário de cadastro de produto
│       ├── sales/
│       │   ├── page.tsx     # Listagem e gestão de vendas
│       │   └── register/
│       │       └── page.tsx # Formulário de registro de venda
│       ├── categories/
│       │   └── page.tsx     # CRUD de categorias
│       └── reports/
│           └── page.tsx     # Relatórios (WIP)
│
└── src/
    ├── components/          # Componentes reutilizáveis
    │   ├── Badge.tsx
    │   ├── EmptyState.tsx
    │   ├── ErrorAlert.tsx
    │   ├── KpiCard.tsx
    │   ├── LoadingState.tsx
    │   ├── Modal.tsx
    │   ├── PageHeader.tsx
    │   ├── ProductImage.tsx
    │   └── SearchFilterBar.tsx
    └── lib/
        └── api.ts           # Cliente HTTP centralizado
```

---

## Rotas da Aplicação

| Rota | Descrição |
|---|---|
| `/` | Tela de login |
| `/dashboard` | Visão geral financeira com KPIs e gráficos |
| `/products` | Listagem de produtos com busca server-side |
| `/products/register` | Formulário de cadastro de produto |
| `/sales` | Histórico de vendas com busca e filtro de status |
| `/sales/register` | Formulário de registro de venda |
| `/categories` | Gestão de categorias |
| `/reports` | Relatórios (em desenvolvimento) |

### Fluxo de Autenticação

A rota `/` exibe o formulário de login. Após autenticação bem-sucedida, o token JWT retornado pela API é salvo em `localStorage` com a chave `API_TOKEN`. Todas as requisições subsequentes incluem esse token no header `Authorization: Bearer <token>`.

---

## Componentes Reutilizáveis

Todos os componentes ficam em `src/components/` e seguem o design system da aplicação (tokens do Tailwind CSS v4).

### `PageHeader`

Cabeçalho padrão de página com título, descrição, breadcrumbs, botão de refresh e botão de ação principal.

```tsx
<PageHeader
  title="Produtos Cadastrados"
  description="Visualize e gerencie seus produtos"
  breadcrumbs={[{ label: "Produtos", icon: "inventory_2" }, { label: "Catálogo" }]}
  onRefresh={loadProducts}
  actionButton={{ label: "Cadastrar Produto", icon: "add", href: "/products/register" }}
/>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título principal da página |
| `description` | `string?` | Subtítulo descritivo |
| `breadcrumbs` | `Array<{label, href?, icon?}>?` | Trilha de navegação |
| `onRefresh` | `() => void` | Callback do botão de atualização |
| `actionButton` | `{label, href?, onClick?, icon?, variant?}?` | CTA principal (link ou botão) |
| `rightContent` | `ReactNode?` | Conteúdo customizado à direita |

---

### `Badge`

Chip de status ou categoria. Suporta cores HEX personalizadas (para categorias) ou variantes semânticas fixas.

```tsx
// Categoria com cor HEX
<Badge label="Eletrônicos" color="#0051d5" />

// Status semântico
<Badge label="Concluída" variant="success" />
<Badge label="5" variant="danger" tabular />
```

| Prop | Tipo | Descrição |
|---|---|---|
| `label` | `string` | Texto exibido no badge |
| `color` | `string?` | Cor HEX — tem precedência sobre `variant` |
| `variant` | `"success" \| "warning" \| "danger" \| "info" \| "default"` | Variante semântica |
| `tabular` | `boolean?` | Aplica fonte tabular (para contadores) |

---

### `KpiCard`

Card de métrica para o Dashboard, com suporte a delta percentual em relação ao período anterior.

```tsx
<KpiCard
  title="Receita Bruta"
  value="R$ 12.450,00"
  icon="trending_up"
  delta={0.125}
  deltaLabel="vs último mês"
/>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Rótulo da métrica |
| `value` | `string \| number` | Valor principal exibido |
| `icon` | `string` | Ícone Material Symbols |
| `delta` | `number?` | Variação em decimal (ex: `0.12` = +12%) |
| `deltaLabel` | `string?` | Legenda do delta (padrão: `"vs ultimo período"`) |
| `iconColorClass` | `string?` | Classe Tailwind para a cor do ícone |

---

### `SearchFilterBar`

Barra de busca com suporte a filtros adicionais via `children` e exibição de contagem de resultados.

```tsx
<SearchFilterBar
  placeholder="Filtrar por nome..."
  value={searchTerm}
  onChange={setSearchTerm}
  totalCountText={`Total: ${products.length} produtos`}
  isLoading={isLoading}
/>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `placeholder` | `string` | Placeholder do campo de busca |
| `value` | `string` | Valor controlado |
| `onChange` | `(val: string) => void` | Callback de mudança |
| `totalCountText` | `string?` | Texto de contagem exibido à direita |
| `isLoading` | `boolean?` | Substitui o texto por "Carregando..." |
| `children` | `ReactNode?` | Filtros adicionais renderizados entre a busca e a contagem |
| `icon` | `string?` | Ícone do campo de busca (padrão: `"search"`) |

---

### `Modal`

Modal genérico com backdrop blur, animação de entrada e botão de fechar.

```tsx
<Modal
  isOpen={editTarget !== null}
  onClose={() => setEditTarget(null)}
  title="Editar Venda"
  titleIcon="edit"
  titleIconColor="text-secondary"
  size="md"
>
  {/* conteúdo */}
</Modal>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `isOpen` | `boolean` | Controla a visibilidade |
| `onClose` | `() => void` | Callback ao fechar |
| `title` | `string` | Título do modal |
| `titleIcon` | `string?` | Ícone Material Symbols no título |
| `titleIconColor` | `string?` | Classe de cor do ícone (padrão: `"text-error"`) |
| `children` | `ReactNode` | Conteúdo do modal |
| `footer` | `ReactNode?` | Rodapé com ações (renderizado à direita) |
| `size` | `"sm" \| "md" \| "lg"` | Largura máxima do modal |

---

### `ProductImage`

Exibe a imagem de um produto com fallback para ícone quando a URL é nula ou quando ocorre erro de carregamento.

```tsx
<ProductImage url={product.imageUrl} name={product.name} size="lg" />
```

| Prop | Tipo | Descrição |
|---|---|---|
| `url` | `string \| null \| undefined` | URL da imagem |
| `name` | `string` | Nome do produto (usado como `alt`) |
| `size` | `"sm" \| "lg"` | Tamanho do container (`40px` ou `64px`) |

**Estados:**
- `url` ausente → ícone `image_not_supported`
- Erro de carregamento (`onError`) → ícone `broken_image` com borda de erro

---

### `EmptyState`

Estado vazio centralizado com ícone, título, descrição e CTA opcional.

```tsx
<EmptyState
  icon="inventory_2"
  title="Nenhum produto encontrado"
  description="Cadastre seu primeiro produto."
  actionButton={{ label: "Cadastrar", icon: "add", href: "/products/register" }}
/>
```

---

### `ErrorAlert`

Banner de erro com mensagem e botão opcional de "Tentar Novamente".

```tsx
<ErrorAlert
  title="Falha ao carregar produtos"
  message={loadError}
  onRetry={loadProducts}
/>
```

---

### `LoadingState`

Spinner de carregamento centralizado.

```tsx
<LoadingState message="Carregando produtos..." />
```

---

## Cliente de API

Localizado em `src/lib/api.ts`, o módulo exporta funções tipadas que encapsulam todas as chamadas à API REST do backend.

**URL Base:** `http://127.0.0.1:3333/api/v1`

**Autenticação:** O token é lido de `localStorage` (`API_TOKEN`) e enviado automaticamente no header `Authorization: Bearer <token>` em toda requisição.

### Módulos disponíveis

#### Autenticação
```ts
login(email: string, password: string): Promise<{ token: string }>
```

#### Categorias
```ts
getCategories(search?: string): Promise<ApiCategory[]>
getCategoryById(id: string): Promise<ApiCategory>
createCategory(body: CreateCategoryBody): Promise<ApiCategory>
updateCategory(id: string, body: UpdateCategoryBody): Promise<ApiCategory>
deleteCategory(id: string): Promise<void>
```

#### Produtos
```ts
getProducts(search?: string): Promise<ApiProduct[]>
getProductById(id: string): Promise<ApiProductDetail>
createProduct(body: CreateProductBody): Promise<ApiProduct>
updateProduct(id: string, body: UpdateProductBody): Promise<ApiProduct>
deleteProduct(id: string): Promise<void>
uploadProductImage(file: File): Promise<{ imageUrl: string }>
```

> `imageUrl` em `UpdateProductBody` aceita `string | null`. Envie `null` para remover a imagem.

#### Precificação
```ts
calculatePricing(body: PricingInput): Promise<PricingResult>
```

Consome o endpoint `POST /pricing/calculate`, que centraliza toda a lógica de cálculo de preço sugerido, markup e lucro líquido no backend.

#### Vendas
```ts
getSales(productName?: string, status?: SaleStatus): Promise<ApiSale[]>
createSale(body: CreateSaleBody): Promise<SaleMutationResponse>
updateSale(id: string, body: UpdateSaleBody): Promise<SaleMutationResponse>
deleteSale(id: string): Promise<void>
getPaymentMethods(): Promise<ApiPaymentMethod[]>
```

> `SaleStatus` = `"COMPLETED" | "LOSS" | "RETURNED" | "PENDING"`

> A exclusão de uma venda **reverte o estoque** do produto correspondente no backend.

#### Dashboard
```ts
getDashboardStats(days?: number): Promise<ApiDashboardStatsData>
getProductPriceEvolution(productId: string, days?: number): Promise<ApiProductPriceEvolution[]>
```

### Tratamento de Erros

A função interna `apiFetch` trata os seguintes casos:
- **404** → extrai `message` do corpo JSON ou usa a mensagem do status HTTP.
- **Demais erros HTTP** → idem.
- Em ambos os casos, lança um `Error` com a mensagem extraída, permitindo captura com `try/catch` nos componentes.

---

## Convenções de Código

### Busca com Debounce

Todas as páginas de listagem implementam debounce de **300ms** no campo de busca antes de disparar a requisição ao servidor, evitando chamadas excessivas:

```ts
useEffect(() => {
  const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
  return () => clearTimeout(handler);
}, [searchTerm]);
```

### Padrão de Estado de UI

Cada página segue o padrão:

```
isLoading → <LoadingState />
loadError → <ErrorAlert />
data.length === 0 → <EmptyState />
data.length > 0 → <tabela ou listagem>
```

### Padrão de Modais

- **Edição** → estado `editTarget: T | null`. Modal abre quando `editTarget !== null`.
- **Exclusão** → estado `deleteTarget: T | null`. Modal de confirmação abre quando `deleteTarget !== null`.

### Precificação Dinâmica no Painel de Produto

O drawer de detalhes do produto recalcula os indicadores (markup, margem de contribuição, lucro líquido) em tempo real enquanto o usuário edita os campos de custo/margem/preço, com debounce de **400ms**, chamando `POST /pricing/calculate`.

### Campos Decimais na API

Campos de percentual são trafegados como decimais (ex.: `taxRate: 0.18` = 18%, `desiredMargin: 0.30` = 30%). A conversão de/para percentual para exibição e entrada do usuário é feita nos componentes de página.

# Sistema de Infrequência Escolar — Juiz de Fora

Sistema para registro e acompanhamento de infrequência escolar da Rede Municipal de Ensino.

---

## Deploy no Vercel (passo a passo)

### 1. Criar banco de dados Turso (gratuito)

```bash
# Instalar CLI do Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Criar banco
turso db create infrequencia-jf

# Pegar a URL
turso db show infrequencia-jf --url

# Criar token de autenticação
turso db tokens create infrequencia-jf
```

Guarde a URL (`libsql://...turso.io`) e o token gerado.

---

### 2. Fazer deploy no Vercel

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://infrequencia-jf-xxxxx.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJ...` (token gerado no passo anterior) |

4. Clique em **Deploy**

O Vercel detecta automaticamente o `vercel.json` e configura tudo.

---

### 3. Primeiro acesso

Após o deploy, acesse o sistema com o código padrão de administrador:

```
admin2026
```

Use o Painel Administrativo para gerar códigos para os coordenadores.

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Rodar em desenvolvimento (SQLite local, sem Turso)
npm run dev
```

O banco local é criado automaticamente em `data/app.db`.

---

## Estrutura do projeto

```
├── api/
│   └── trpc/[trpc].ts      # Serverless function do Vercel
├── client/
│   └── src/
│       ├── pages/           # Telas do sistema
│       └── lib/trpc.ts      # Client tRPC
├── server/
│   ├── routers.ts           # Rotas tRPC
│   └── storage.ts           # Acesso ao banco (Turso/SQLite)
├── shared/                  # Tipos compartilhados
├── vercel.json              # Configuração do Vercel
└── vite.config.ts           # Build do frontend
```

---

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|---|---|---|
| `TURSO_DATABASE_URL` | Em produção | URL do banco Turso |
| `TURSO_AUTH_TOKEN` | Em produção | Token de autenticação Turso |

Sem essas variáveis (desenvolvimento), o sistema usa SQLite local em `data/app.db`.

# Como Iniciar o Sistema

## Requisitos
- Node.js 18+ instalado

## Passos

### 1. Instalar dependências
```
npm install --legacy-peer-deps
```

### 2. Iniciar o servidor
```
npm run dev
```

### 3. Acessar o sistema
Abra o navegador em: http://localhost:3000

## Código de acesso inicial
- **Código:** `admin2026`
- **Tipo:** Administrador SEC (acesso total)

Com este código você acessa o Painel Administrativo e pode:
- Gerar novos códigos para coordenadores
- Ver todas as escolas, ocorrências e acessos

## Observação
Os dados ficam na memória do servidor. Ao reiniciar o servidor, os dados são apagados,
exceto os códigos criados (que você deverá recriar). Para persistência real, configure
DATABASE_URL no arquivo .env com um banco MySQL.

# FinFlow

Aplicação backend (Node.js + Fastify + Prisma + MySQL) para gestão financeira pessoal: contas, categorias e lançamentos (transações) com autenticação JWT.

## Stack
- Runtime: Node.js
- Framework: Fastify (tipado com Zod Type Provider)
- ORM: Prisma
- Banco: MySQL
- Auth: JWT
- Rate limiting: @fastify/rate-limit (aplicado no login)
- Docs: Swagger (Fastify Swagger + UI)

---

## Estrutura de Pastas
```
prisma/
  schema.prisma
  migrations/
  seed.ts
src/
  server.ts
  controllers/
    accountController.ts
    categoriesController.ts
    transactionController.ts
    userController.ts
  routes/
    user.routes.ts
    transaction.routes.ts
    ...
  services/
    userService.ts
    categoriesService.ts
    prisma.ts (client central)*
  usecases/
    transactions/
      CreateTransactionUseCase.ts
      ListTransactionsUseCase.ts
      UpdateTransactionUseCase.ts
      DeleteTransactionUseCase.ts
  dtos/
  middlewares/
.env
```
(* presumido: prisma client centralizado em `services/prisma.ts`)

---

## Modelos (Prisma)
Ver [prisma/schema.prisma](prisma/schema.prisma)

Enums:
- `CategoryType`: income | expense
- `TransactionType`: income | expense

Relacionamentos principais:
- User -> Accounts / Categories / Transactions

---

## Regras de Negócio Principais
1. **Saldo de Conta**  
   - Criar transação:  
     - income: soma `amount` ao `balance`  
     - expense: subtrai `amount`  
   - Deletar transação:  
     - income: subtrai `amount`  
     - expense: soma `amount`

2. **Validação de tipo**  
   - Tipo da transação deve coincidir com tipo da categoria.

3. **Data da transação (`date`)**  
   - Permite lançar hoje algo ocorrido antes.

4. **Filtros de listagem**  
   - Período, categoria, tipo (implementado em `listTransactions`).

---

## Autenticação
- Registro: `createUser`
- Login: `loginUser` → retorna JWT
- JWT em `Authorization: Bearer <token>`

Rate limiting aplicado somente no login.

---

## Endpoints (Resumo)
**Auth / Users**
- POST /register
- POST /login
- GET /users
- GET /user/:id
- DELETE /user/:id

**Categorias**
- POST /categories
- GET /categories
- PATCH /category/:id
- DELETE /category/:id
- DELETE /categories (bulk)

**Contas**
- POST /accounts
- GET /accounts
- PATCH /account/:id
- DELETE /account/:id
- DELETE /accounts (bulk)

**Transações**
- POST /transaction
- GET /transactions (filtros)
- PATCH /transaction/:id
- DELETE /transaction/:id

---

## Filtros de Transações
Exemplo:
```
/transactions?startDate=2024-06-01&endDate=2025-08-07&categoryId=<uuid>&type=income
```

---

## Exemplo Fluxo (Postman)
1. Registro:
```json
POST /register
{ "name": "Alice", "email": "alice@mail.com", "password": "secret123" }
```

2. Login:
```json
POST /login
{ "email": "alice@mail.com", "password": "secret123" }
```

3. Criar conta:
```json
POST /accounts
Authorization: Bearer <token>
{ "name": "Banco XP", "type": "checking", "balance": 0 }
```

4. Criar categoria:
```json
POST /categories
{ "name": "Salário", "type": "income" }
```

5. Criar transação:
```json
POST /transaction
{
  "amount": 2000,
  "date": "2025-08-07T00:00:00.000Z",
  "type": "income",
  "description": "Receita extra",
  "accountId": "<accountId>",
  "categoryId": "<categoryId>"
}
```

6. Listar:
```
GET /transactions?type=income&startDate=2025-08-01
```

---

## 🚀 Guia de Setup

### 1. Clonar e instalar dependências
```bash
git clone <url-do-repositorio>
npm install -g pnpm # caso não possua o pnpm instalado globalmente
pnpm install
pnpm prisma generate   # gera o Prisma Client
```

### 2. Criar arquivo `.env`
```env
DATABASE_URL="mysql://vini:vini123@mysql:3306/finflow_db"
JWT_SECRET="um-segredo-misterioso-e-bem-escondido-bem-aqui"
PORT=3333
```

### 3. Subir MySQL + API
```bash
docker compose up -d
# OU forçar rebuild:
pnpm run docker:up
```

O Docker já executa:
- ✅ prisma generate  
- ✅ prisma migrate deploy  
- ✅ inicia o servidor em modo dev  

### 4. Verificar se está funcionando
Logs da API:
```bash
pnpm run docker:logs:api
```

API: http://localhost:3333/api  
Swagger: http://localhost:3333/api/docs  
MySQL: `localhost:3307`

---

## 🎯 Comandos Úteis
```bash
pnpm run docker:down        # parar todos os serviços
pnpm run docker:down:vol    # parar e resetar volumes
pnpm run db:seed            # rodar seed
pnpm run mysql:shell        # acessar shell MySQL
pnpm run db:generate        # gerar client prisma
pnpm run db:migrate:dev     # criar nova migração
```

---

## 🔍 Troubleshooting
**Erro de conexão com MySQL**
```bash
docker compose ps
docker compose logs mysql
```

**Porta em uso**
```bash
lsof -i :3333
# ou alterar no .env → PORT=3334
```

**Permissões MySQL**
```bash
pnpm run mysql:grant
```

---

## 📁 Estrutura Final
```
Finflow/
├── .env
├── docker-compose.yml
├── Dockerfile.dev
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── server.ts
    ├── controllers/
    ├── routes/
    ├── services/
    └── usecases/
```

---

## ✅ Checklist de Funcionamento
- Docker rodando sem erros  
- API em http://localhost:3333/api  
- Swagger em /api/docs  
- MySQL na porta 3307  
- Registro/Login funcionando  
- JWT validado em rotas protegidas  

---

## Possíveis Melhorias Futuras
- Paginação em `/transactions`
- Soft delete e cascata controlada
- Testes automatizados
- Relatórios agregados por mês/tipo

---

## Status
🚧 Projeto em andamento

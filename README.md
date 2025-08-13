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

## Estrutura de Pastas
```
prisma/
  schema.prisma
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
(* presumido: prisma client centralizado em `services/prisma.ts` pois é importado em [`transactionController`](src/controllers/transactionController.ts))

## Modelos (Prisma)
Ver [prisma/schema.prisma](prisma/schema.prisma)

Enums:
- `CategoryType`: income | expense
- `TransactionType`: income | expense

Relacionamentos principais:
- User -> Accounts / Categories / Transactions

## Regras de Negócio Principais
1. Saldo de Conta:
   - Ao criar transação: [`createTransaction`](src/controllers/transactionController.ts)
     - income: soma `amount` ao `balance`
     - expense: subtrai `amount`
   - Ao deletar transação: [`deleteTransaction`](src/controllers/transactionController.ts)
     - Reverte o efeito (income subtrai, expense soma)
2. Validação de tipo:
   - Tipo da transação deve coincidir com tipo da categoria (income/expense)
3. Data da transação (`date`):
   - Registro histórico (permite lançar hoje algo ocorrido antes)
4. Filtros de listagem:
   - Período (startDate / endDate), categoria, tipo em [`listTransactions`](src/controllers/transactionController.ts)

## Autenticação
- Registro: [`createUser`](src/controllers/userController.ts)
- Login: [`loginUser`](src/controllers/userController.ts) retorna JWT
- Token incluído em `Authorization: Bearer <token>`
- userId usado nas consultas (ex: [`listTransactions`](src/controllers/transactionController.ts))

## Rate Limiting
Aplicado somente na rota de login via `app.rateLimit({...})` em [`user.routes.ts`](src/routes/user.routes.ts)

## Endpoints (Resumo)
Auth / Users:
- POST /register
- POST /login
- GET /users
- GET /user/:id
- DELETE /user/:id

Categorias:
- POST /categories
- GET /categories
- PATCH /category/:id
- DELETE /category/:id
- DELETE /categories (bulk) *(conforme controller)*

Contas:
- POST /accounts
- GET /accounts
- PATCH /account/:id
- DELETE /account/:id
- DELETE /accounts (bulk)*

Transações:
- POST /transaction
- GET /transactions (filtros)
- PATCH /transaction/:id
- DELETE /transaction/:id

(Confirme nomes/rotas exatos nas definições em `routes/`)

## Filtros de Transações
Exemplo GET:
```
/transactions?startDate=2024-06-01&endDate=2025-08-07&categoryId=<uuid>&type=income
```
Parâmetros (todos opcionais):
- startDate (YYYY-MM-DD ou ISO)
- endDate
- categoryId
- type (income | expense)

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
Recebe: `{ "token": "..." }`
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
5. Criar transação (entrada):
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
6. Listar filtrando:
```
GET /transactions?type=income&startDate=2025-08-01
```

## Serviços
- Usuários: [`userService`](src/services/userService.ts)
- Categorias: [`categoriesService`](src/services/categoriesService.ts)

## Atualização de Saldo
Implementada diretamente no controller antes/depois das operações de transação (não delegada ao use case) em:
- [`createTransaction`](src/controllers/transactionController.ts)
- [`deleteTransaction`](src/controllers/transactionController.ts)

## Validação / Schemas
Rotas utilizam Zod (ver exemplos em [`user.routes.ts`](src/routes/user.routes.ts) e [`transaction.routes.ts`](src/routes/transaction.routes.ts)) para:
- Corpo (body)
- Params
- Querystring
- Schemas de resposta (integração Swagger)

## Execução do Projeto
Pré-requisitos:
- Docker (para subir MySQL via docker-compose)
- Node + pnpm

Passos:
```bash
pnpm install
docker compose up -d
pnpm prisma migrate dev
pnpm dev
```
Acessar Swagger UI: `http://localhost:3333/docs`

## Variáveis de Ambiente (.env)
```
DATABASE_URL="mysql://user:password@localhost:3306/finflow"
JWT_SECRET="sua-chave-secreta"
```

## Migrações
Geradas em `prisma/migrations/`. Para criar nova:
```
pnpm prisma migrate dev --name descricao
```

## Possíveis Melhorias Futuras
- Paginação em `/transactions`
- Soft delete de usuários / cascata controlada
- Validação adicional de ownership (todas entidades)
- Service layer para saldo (evitar lógica duplicada)
- Testes automatizados (unit/integration)
- Categories únicas por usuário (constraint)
- Relatórios agregados (sum por mês / tipo)

## Status
Arquivo [README.md](README.md) original indicava “PROJETO EM ANDAMENTO”.

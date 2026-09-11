# Flor de Maio

Clube de leitura da Flor de Maio — plataforma para os membros acompanharem
leituras, participarem de rankings e interagirem com o clube.

## Arquitetura

- **Frontend**: Next.js 15 (App Router, TypeScript), Tailwind CSS, shadcn/ui,
  TanStack Query, react-hook-form, zod — `frontend/`
- **Backend**: FastAPI (Python, async), SQLAlchemy + Alembic, port 3001 —
  `backend/`
- **Database**: PostgreSQL

## Escopo da Fase 1

Nesta primeira fase, as seguintes áreas estão funcionais:

- **Login e aprovação de membros** — cadastro de novos membros com aprovação
  pelo admin antes do primeiro acesso
- **Ranking** — classificação dos membros do clube
- **Reading Rats** — o programa de leitura gamificado do clube

As demais áreas do app (biblioteca, desafios, feed, livros, produtos,
sugestões, painel admin completo) estão **em desenvolvimento** e podem
existir como telas parciais ou placeholders neste momento.

## Quick Start com Docker (recomendado)

### Pré-requisitos
- Docker
- Docker Compose

### Ambiente de produção
```bash
docker compose up -d --build
# Frontend: http://localhost:5001
# Backend API: http://localhost:3002
# Database: localhost:5532
```

Essas portas de host (5001/3002/5532) são deliberadamente diferentes das do
projeto irmão "Direito e Literatura" (5000/3001/5432) para que os dois
stacks possam rodar ao mesmo tempo na mesma máquina sem conflito de porta.
Dentro da rede Docker do projeto os serviços continuam se comunicando pelas
portas "padrão" (`backend:3001`, `postgres:5432`) — só o mapeamento exposto
ao host mudou.

Após subir os containers pela primeira vez, entre com o login de admin
semeado no banco:

- **Email**: `lisloureiro.sousa@gmail.com`
- **Senha temporária**: `FlorDeMaio2026!`

**Importante**: troque essa senha temporária imediatamente após o primeiro
login, em `/perfil`.

### Desenvolvimento com Docker (hot-reload)
```bash
docker compose -f docker-compose.dev.yml up --build
```

Esse arquivo monta `backend/app` e `backend/alembic` (para o backend refletir
mudanças no código sem rebuild) e `frontend/` inteiro (para o Next.js em modo
`npm run dev` recarregar automaticamente), com `node_modules` e `.next`
excluídos do bind mount para não conflitar com o que foi instalado dentro do
container.

### Deploy no Vercel + Neon (dois projetos)

`frontend/` e `backend/` são publicados como dois projetos Vercel
independentes (duas URLs separadas), cada um com seu próprio **Root
Directory** apontando para a respectiva pasta.

**Projeto do backend** (Root Directory: `backend/`):
1. O Vercel detecta automaticamente `backend/api/index.py` (um shim fino que
   reexporta o app FastAPI de `app.main`) como uma função serverless Python —
   não é necessário `vercel.json`. `backend/requirements.txt` fica na raiz
   desse projeto, exatamente onde o Vercel espera encontrá-lo.
2. **Banco de dados**: funções do Vercel são serverless (não há um container
   Postgres persistente como o que o `docker-compose.yml` fornece
   localmente) — provisione um Postgres real acessível pela internet. O
   [Neon](https://neon.tech) é recomendado (é o que roda por trás do
   "Vercel Postgres"; string de conexão simples, sem lock-in de SDK) — mais
   fácil de configurar pela aba **Storage** do projeto no dashboard do
   Vercel → "Create Database" → Neon.
3. Configure as variáveis de ambiente: `DATABASE_URL` (do passo 2),
   `ADMIN_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `CORS_ORIGINS` (a URL
   do projeto do frontend).
4. Garanta que **Deployment Protection** esteja desligado (ou em um modo que
   permita acesso público) — caso contrário toda requisição, inclusive as do
   frontend, é redirecionada para uma tela de login do Vercel em vez de uma
   resposta real da API.
5. Rode as migrações do Alembic uma vez contra esse `DATABASE_URL` (o Vercel
   não executa um script de startup como o `entrypoint.sh` do Docker):
   `cd backend && DATABASE_URL=<url-do-neon> alembic upgrade head`. Repita
   sempre que uma nova migração for adicionada.

**Projeto do frontend** (Root Directory: `frontend/`):
1. Deploy padrão de app Next.js — o Vercel detecta automaticamente, sem
   configuração extra para o build em si.
2. Defina `BACKEND_URL` com a URL pública do projeto do backend. Isso faz com
   que os `rewrites()` do `next.config.js` façam o proxy de `/api/*` e
   `/uploads/*` transparentemente para o backend, então o domínio do
   frontend é o único link que os usuários finais precisam (opcional — se
   preferir, o frontend pode chamar a URL do backend diretamente pelo
   navegador, mas nesse caso `CORS_ORIGINS` no backend precisa corresponder
   exatamente à origem do frontend).

### Setup manual (sem Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
pip install -r requirements.txt
cp .env.example .env   # edite DATABASE_URL, ADMIN_PASSWORD, CORS_ORIGINS, JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload --port 3001
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # BACKEND_URL=http://localhost:3001
npm run dev             # http://localhost:5000
```

## Estrutura do projeto

```
backend/
  app/
    main.py          # app FastAPI, CORS, monta /uploads, inclui routers
    config.py        # configurações via variáveis de ambiente
    database.py       # engine/sessão assíncrona do SQLAlchemy
    auth.py            # autenticação admin (bearer token)
    security.py         # autenticação de membros (JWT)
    routers/              # um router por recurso
  alembic/                # migrações do banco
  api/index.py            # shim serverless para deploy no Vercel
  entrypoint.sh            # roda migrações e sobe o uvicorn (Docker)
  requirements.txt
  Dockerfile

frontend/
  app/                # páginas do Next.js App Router
  src/
    components/       # componentes de UI (incl. primitivas shadcn/ui)
    hooks/, lib/
  next.config.js       # proxy de /api/* e /uploads/* para o backend
  Dockerfile

docker-compose.yml       # postgres + backend + frontend (produção)
docker-compose.dev.yml   # variante com hot-reload
```

## Variáveis de ambiente

**backend/.env**

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão do Postgres | `postgresql://flordemaio:flordemaio123@localhost:5532/flordemaio` |
| `PORT` | Porta em que o uvicorn escuta (Docker) | `3001` |
| `ADMIN_PASSWORD` | Senha do login admin (token bearer derivado dela) | `flordemaio2026` |
| `CORS_ORIGINS` | Lista separada por vírgula de origens permitidas | `http://localhost:5001` |
| `JWT_SECRET` | Segredo para assinar os JWTs de membro | `change-me-in-production` |
| `JWT_EXPIRE_MINUTES` | Validade do JWT de membro, em minutos | `10080` |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob (uploads de foto); vazio localmente cai no fallback de disco local | *(vazio)* |

**frontend/.env**

| Variável | Descrição | Exemplo |
|---|---|---|
| `BACKEND_URL` | URL do backend usada pelos `rewrites()` do Next.js | `http://backend:3001` |

**raiz (docker-compose)**

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_PASSWORD` | Senha do usuário Postgres `flordemaio` | `flordemaio123` |
| `ADMIN_PASSWORD` | Repassada ao serviço `backend` | `flordemaio2026` |
| `CORS_ORIGINS` | Repassada ao serviço `backend` | `http://localhost:5001` |

## Notas

- `BLOB_READ_WRITE_TOKEN` não configurado faz o backend usar disco local
  (`backend/public/uploads`) como fallback para uploads de foto em
  desenvolvimento.
- O token de autenticação admin é derivado de `ADMIN_PASSWORD` (determinístico
  entre instâncias), não gerado aleatoriamente por processo.

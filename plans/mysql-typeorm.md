# Persistir usuários no MySQL 5.7 com TypeORM

## Contexto

Hoje [users.service.ts](apps/api/src/users/users.service.ts) guarda os usuários num array em memória, então tudo se perde quando a API reinicia. Vamos trocar esse array por MySQL 5.7, rodando via Docker Compose na raiz do projeto, com um volume para persistir os dados. O ORM escolhido é o **TypeORM**.

## Escolha do ORM

| ORM | Prós | Contras para este projeto |
|---|---|---|
| **TypeORM** ✅ | Integração oficial do Nest (`@nestjs/typeorm`, `forFeature`, `getRepositoryToken`); entidades com decorators, no mesmo estilo de `class-validator` e `@nestjs/swagger`, que o projeto já usa; suporta MySQL 5.7 via `mysql2`; tem migrations | Tipagem das queries mais fraca que a do Prisma ou do Drizzle |
| Prisma | DX ótima, client fortemente tipado, migrations declarativas | Schema DSL separado (`schema.prisma`) e etapa de `generate`; binário de engine; o suporte a MySQL 5.7 já está no limite do que ele ainda aceita; não usa DI/decorators do Nest |
| MikroORM | Unit of Work/Identity Map, bem tipado, tem módulo Nest | Comunidade e docs menores, curva maior (UoW, `em.fork`); exagero para um CRUD de usuários |
| Sequelize (`@nestjs/sequelize`) | Maduro, tem módulo Nest oficial | Tipagem TS fraca/verbosa (`sequelize-typescript`), API mais antiga |
| Drizzle | Leve, SQL-like, ótima tipagem | Sem módulo Nest oficial; ferramentas de migration voltadas para versões mais novas; é mais um query builder do que um ORM |

**Por que TypeORM:** é o ORM que a documentação do Nest usa como referência, encaixa direto na DI (`@InjectRepository`), deixa o service fácil de testar com um repositório mockado e mantém o estilo de decorators do código atual. O MySQL 5.7 tem suporte completo pelo driver `mysql2`.

## Implementação

### 1. Docker Compose (raiz): `docker-compose.yml`
- Serviço `mysql` com a imagem `mysql:5.7`, `restart: unless-stopped`.
- `command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`.
- Env com defaults: `MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD:-root}`, `MYSQL_DATABASE=${DB_DATABASE:-code_connect}`, `MYSQL_USER`/`MYSQL_PASSWORD` (`code_connect`/`code_connect`).
- Porta `"${DB_PORT:-3308}:3306"`. Uso 3308 porque o WAMP costuma ocupar a 3306 (MySQL) e a 3307 (MariaDB).
- **Volume nomeado** `mysql-data:/var/lib/mysql`, declarado em `volumes:`. É mais confiável no Windows do que um bind mount, que tem problemas de permissão e desempenho com o MySQL. Os dados sobrevivem ao `docker compose down`; só o `down -v` apaga.
- Bind de `./docker/mysql/init:/docker-entrypoint-initdb.d:ro` com o script `docker/mysql/init/01-test-db.sql`, que cria o banco `code_connect_test` e dá GRANT ao usuário da aplicação. Esse banco é usado pelos testes e2e.
- `healthcheck` com `mysqladmin ping`.

### 2. Dependências (`apps/api`)
`pnpm --filter api add @nestjs/typeorm typeorm mysql2 @nestjs/config`

### 3. Configuração
- [.env.example](apps/api/.env.example): adicionar `DB_HOST=localhost`, `DB_PORT=3308`, `DB_USERNAME=code_connect`, `DB_PASSWORD=code_connect`, `DB_DATABASE=code_connect`.
- Novo `apps/api/src/database/data-source.ts`: exporta `dataSourceOptions` (type `mysql`, valores lidos de `process.env` com os mesmos defaults acima, `entities: [User]`, `migrations: [__dirname + '/migrations/*{.ts,.js}']`, `synchronize: false`, `migrationsRun: true`, `charset: 'utf8mb4'`) e um `default new DataSource(...)` para a CLI.
- [app.module.ts](apps/api/src/app.module.ts): `ConfigModule.forRoot({ isGlobal: true })` (carrega `apps/api/.env`) e `TypeOrmModule.forRootAsync({ useFactory: () => dataSourceOptions })`. A factory garante que o `.env` já foi carregado quando as opções são lidas.
- Scripts em [apps/api/package.json](apps/api/package.json): `"typeorm": "typeorm-ts-node-commonjs -d src/database/data-source.ts"`, `migration:generate` e `migration:run`. Na raiz: `db:up` (`docker compose up -d`) e `db:down`.

### 4. Entidade e migration
- [user.entity.ts](apps/api/src/users/entities/user.entity.ts): trocar a interface por uma classe `@Entity('users')`:
  - `@PrimaryGeneratedColumn('uuid') id` (gerado pelo TypeORM e salvo como `varchar(36)`, já que o 5.7 não tem tipo UUID)
  - `@Column({ length: 100 }) name`
  - `@Index({ unique: true }) @Column() email` (varchar 255 em utf8mb4 cabe no índice do InnoDB do 5.7)
  - `@Column({ name: 'password_hash' }) passwordHash`
  - `@CreateDateColumn({ name: 'created_at' }) createdAt`
  
  O `UserResponseDto.fromEntity` continua funcionando sem mudanças.
- `apps/api/src/database/migrations/<timestamp>-CreateUsers.ts`: gerar com `migration:generate` e revisar o resultado (CREATE TABLE `users` com índice único em `email`).

### 5. UsersService com repositório
- [users.module.ts](apps/api/src/users/users.module.ts): `imports: [TypeOrmModule.forFeature([User])]`.
- [users.service.ts](apps/api/src/users/users.service.ts): injetar `@InjectRepository(User) private readonly users: Repository<User>`.
  - `create`: mantém a normalização e o hash; faz a checagem prévia com `await this.findByEmail` e depois `this.users.save(this.users.create({...}))`. O `randomUUID` sai, porque o id passa a ser gerado pela coluna. Captura o erro `QueryFailedError` com `driverError.code === 'ER_DUP_ENTRY'` e lança `ConflictException`, o que cobre a corrida entre a checagem e o insert.
  - `findByEmail` e `findById` ficam `async` e retornam `Promise<User | null>`, via `findOneBy`.
- Ajustar quem chama:
  - [auth.service.ts](apps/api/src/auth/auth.service.ts): `await this.usersService.findByEmail(email)`.
  - [users.controller.ts](apps/api/src/users/users.controller.ts): `me` fica `async` e faz `await this.usersService.findById(...)`.

### 6. Testes
- [users.service.spec.ts](apps/api/src/users/users.service.spec.ts): montar com `Test.createTestingModule` e `{ provide: getRepositoryToken(User), useValue: fakeRepo }`, um fake em memória com `create`, `save` e `findOneBy`. Manter os casos atuais (hash, normalização, 409, busca) e acrescentar um caso em que `save` lança `ER_DUP_ENTRY` e o resultado é `ConflictException`.
- [users.controller.spec.ts](apps/api/src/users/users.controller.spec.ts) e [auth.service.spec.ts](apps/api/src/auth/auth.service.spec.ts): usar o mesmo fake de repositório, extraído para um helper como `src/users/testing/in-memory-users.repository.ts`. Ajustar para os métodos agora `async` (`await controller.me(...)`, `rejects.toThrow`).
- E2E [app.e2e-spec.ts](apps/api/test/app.e2e-spec.ts): definir `process.env.DB_DATABASE ??= 'code_connect_test'` antes de importar o `AppModule` (por exemplo via `setupFiles` em `test/jest-e2e.json`). No `beforeAll`, depois do `app.init()`, limpar a tabela com `dataSource.getRepository(User).clear()`, porque com dados persistidos o 201/409 deixaria de ser determinístico.

### 7. Docs
- [CLAUDE.md](CLAUDE.md): atualizar o layout (a API agora usa MySQL via TypeORM) e os comandos `pnpm db:up`, migrations e "o e2e exige o container no ar".

### 8. Plano no repositório
Depois da aprovação, mover este plano para `plans/mysql-typeorm.md`, como pede a preferência registrada.

## Verificação
1. `pnpm db:up` e `docker compose ps`: o serviço deve aparecer `healthy`.
2. `pnpm api:test`: os testes unitários passam sem precisar de banco.
3. `pnpm --filter api test:e2e`: passa contra o `code_connect_test`.
4. `pnpm api:dev`: a migration roda no boot. Fazer `POST /v1/users`, reiniciar a API e fazer login em `POST /v1/auth/tokens`; o usuário tem que continuar lá.
5. `docker compose down && docker compose up -d` e confirmar que o usuário ainda existe (persistência pelo volume).
6. `pnpm api:build` e `pnpm api:lint` sem erros.
7. Commits: `build: add mysql 5.7 docker compose` e `feat(api): persist users in mysql with typeorm`.

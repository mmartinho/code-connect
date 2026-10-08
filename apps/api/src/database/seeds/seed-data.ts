export const SEED_EMAIL_DOMAIN = 'seed.codeconnect.dev';
export const SEED_PASSWORD = 'senha-segura-123';

export const seedUsers = [
  { name: 'julio', email: `julio@${SEED_EMAIL_DOMAIN}` },
  { name: 'marcia', email: `marcia@${SEED_EMAIL_DOMAIN}` },
  { name: 'gabriel_luz', email: `gabriel@${SEED_EMAIL_DOMAIN}` },
  { name: 'marcela.lins', email: `marcela@${SEED_EMAIL_DOMAIN}` },
  { name: 'ana.souza', email: `ana@${SEED_EMAIL_DOMAIN}` },
];

export interface SeedPost {
  title: string;
  body: string;
  code: string;
  tags: string[];
  /** File in ./assets copied to uploads/; omitted = post without thumbnail. */
  thumbnail?: string;
  /** Index into seedUsers. */
  author: number;
}

const DILMA = 'Frase atribuída à ex-presidente Dilma Rousseff.';
const LULA = 'Frase atribuída ao ex-presidente Lula.';
const NOTE = 'Conteúdo de exemplo, gerado pelo seed do Code Connect.';

export const seedPosts: SeedPost[] = [
  {
    title: 'Quando atingirmos a meta, vamos dobrar a meta',
    body: `"Nós não vamos colocar uma meta. Nós vamos deixar a meta aberta, mas, quando a gente alcançar a meta, nós vamos dobrar a meta." ${DILMA} ${NOTE} Aqui, a meta virou um bug de recursão.`,
    code: `const meta = () => {\n  if (atingiu(meta)) return dobrar(meta)\n  return meta() // sem condição de parada\n}`,
    tags: ['Front-end', 'React', 'Recursão'],
    thumbnail: 'seed-1.png',
    author: 0,
  },
  {
    title: 'Quero saudar a mandioca',
    body: `Uma das saudações mais lembradas do Planalto. ${DILMA} ${NOTE} Por que não saudar também as dependências do projeto?`,
    code: `const saudar = (item) => \`Quero saudar ${'${item}'}\`\n\nconsole.log(saudar('a mandioca'))`,
    tags: ['JavaScript', 'Acessibilidade'],
    author: 1,
  },
  {
    title: 'Temos que estocar vento',
    body: `A ideia de armazenar uma energia que não se guarda. ${DILMA} ${NOTE} Em código, é como cachear algo que muda a cada requisição.`,
    code: `const estoque = []\n\nfunction estocarVento(vento) {\n  estoque.push(vento) // vazou\n  return estoque.length\n}`,
    tags: ['Back-end', 'Cache', 'Node'],
    thumbnail: 'seed-2.jpg',
    author: 2,
  },
  {
    title: 'Tsunami lá fora, marolinha aqui',
    body: `"Lá, ela é um tsunami; aqui, se ela chegar, vai chegar uma marolinha", sobre a crise financeira de 2008. ${LULA} ${NOTE} Todo post-mortem começa com "achamos que era só uma marolinha".`,
    code: `try {\n  await crise.chegar()\n} catch (tsunami) {\n  console.log('é só uma marolinha')\n}`,
    tags: ['Back-end', 'Node', 'Observabilidade'],
    thumbnail: 'seed-3.jpg',
    author: 3,
  },
  {
    title: 'Mulher sapiens',
    body: `Uma das expressões mais comentadas dos discursos presidenciais. ${DILMA} ${NOTE} Um bom nome de tipo faz a diferença na legibilidade.`,
    code: `type Humano = 'homo sapiens' | 'mulher sapiens'\n\nconst evoluir = (h: Humano): Humano => h`,
    tags: ['TypeScript', 'Front-end'],
    author: 4,
  },
  {
    title: 'Nunca antes na história deste país',
    body: `O bordão mais famoso do período. ${LULA} ${NOTE} Alguns commits também parecem "nunca antes na história deste repositório".`,
    code: `const nuncaAntes = (feito) =>\n  historico.every((antes) => antes !== feito)\n\nnuncaAntes('deploy na sexta') // true, por sorte`,
    tags: ['Git', 'JavaScript'],
    thumbnail: 'seed-4.jpg',
    author: 0,
  },
  {
    title: 'O meio ambiente é uma ameaça ao desenvolvimento sustentável',
    body: `Uma frase que parece um conflito de requisitos. ${DILMA} ${NOTE} Dois requisitos que se anulam são o pesadelo de todo refinamento.`,
    code: `function validar(req) {\n  return req.meioAmbiente && !req.meioAmbiente // sempre false\n}`,
    tags: ['Back-end', 'Requisitos'],
    thumbnail: 'seed-5.jpg',
    author: 1,
  },
  {
    title: 'Nós vamos dobrar a meta, versão com testes',
    body: `Para quem prefere ver o comportamento documentado: o mesmo caso de "dobrar a meta", agora coberto por testes. ${DILMA} ${NOTE}`,
    code: `test('dobrar a meta nunca termina', () => {\n  expect(() => meta()).toThrow(RangeError)\n})`,
    tags: ['Testes', 'React', 'Front-end'],
    thumbnail: 'seed-6.jpg',
    author: 2,
  },
];

export const seedComments: {
  author: number;
  body: string;
  replies?: { author: number; body: string }[];
}[] = [
  {
    author: 1,
    body: 'Achei muito bom seu código, parabéns!',
    replies: [{ author: 0, body: 'Valeu! Fico feliz que tenha gostado.' }],
  },
  {
    author: 2,
    body: 'Quanto tempo você levou para finalizar esse projeto?',
    replies: [
      { author: 0, body: 'Até que foi rápido, uns 3 dias!' },
      { author: 2, body: 'Impressionante!' },
    ],
  },
  { author: 3, body: 'Espero chegar um dia nesse nível! Muito bom!' },
  { author: 4, body: 'Me fez rir e aprender ao mesmo tempo.' },
];

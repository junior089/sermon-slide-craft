# Arquitetura

O Visio Divina é uma aplicação TanStack Start (React 19 com SSR). O navegador cuida do
formulário, do editor, do modo apresentação e da exportação. O servidor expõe uma server
function que monta o prompt, chama o modelo de linguagem, valida a resposta e busca o texto
bíblico.

## Fluxo de geração

1. **Formulário** (`src/components/generator-form.tsx`).
   - Coleta o roteiro, o tema, a série, o pregador, o estilo do culto, a densidade, o modo
     de exibição, a tradução bíblica e o template preferido.
   - A entrada é validada por `generationSettingsSchema` (`src/lib/generation/schemas.ts`).
2. **Server function `generateSlides`** (`src/lib/generation/generate-slides.ts`).
   - Roda só no servidor, porque a chave da API nunca chega ao navegador.
   - Sem `NIM_API_KEY`, devolve o deck do gerador de demonstração.
   - Com Supabase configurado, valida o token de acesso enviado pelo formulário
     (`src/lib/auth/verify-access-token.ts`). Sem login, devolve a prévia local.
3. **Pré-resolução bíblica** (`src/lib/bible/scripture.ts`).
   - `extractScriptureReferences` encontra referências no formato `Livro cap:vers` no
     roteiro, validando o nome do livro contra uma lista de nomes e abreviações em
     português.
   - O texto dessas passagens é buscado antes da chamada ao modelo e entra no prompt. Assim
     os slides são escritos a partir da passagem, não só da referência.
4. **Prompt** (`src/lib/generation/prompt.ts`).
   - O prompt de sistema descreve o esquema JSON esperado, as regras por modo de exibição,
     o guia de templates, os tons e os motivos visuais permitidos.
   - O modelo não escreve texto bíblico: ele devolve a referência e deixa o versículo
     vazio.
5. **Chamada ao modelo.**
   - Usa o Vercel AI SDK com um provedor compatível com OpenAI (NVIDIA NIM, por padrão
     `meta/llama-3.3-70b-instruct`).
   - A primeira tentativa usa saída estruturada (`Output.object`) com o schema Zod. Se o
     provedor recusar, a chamada é repetida em modo texto.
   - Cada chamada tem um timeout configurável.
6. **Validação e reparo.**
   - A resposta é validada por `slideDeckResponseSchema`. O schema é tolerante: valores
     fora do vocabulário viram `undefined` em vez de invalidar o deck.
   - Se a validação falhar, `extractJson` tenta recuperar o JSON de dentro de markdown ou
     texto extra.
   - Se ainda assim falhar, um prompt de reparo (`buildJsonRepairPrompt`) pede ao modelo
     só a correção do formato.
7. **Normalização** (`src/lib/generation/normalizer.ts`).
   - Garante capa no início e encerramento no fim.
   - Deriva o layout a partir do tipo quando falta.
   - Pagina textos longos e limita bullets por modo de exibição.
   - Descarta `mood` e `motifs` que não existem no registro.
   - Distribui os destaques e completa a direção criativa.
8. **Enriquecimento de versículos.** `enrichDeckVerses` preenche o texto dos slides de
   versículo que vieram só com a referência.
9. **Editor** (`src/components/slide-preview.tsx` e `src/components/editor/`).
   - Edição de cada campo, troca de layout e template.
   - Desfazer e refazer, reordenação por arrastar, duplicação e remoção.
   - Salvamento automático com debounce.
10. **Render** (`src/components/slide-canvas.tsx`). Desenha o slide em 1920×1080 e escala
    para o espaço disponível.
11. **Exportação.**
    - PPTX editável com `pptxgenjs` (`src/lib/export/pptx.ts`).
    - PDF com `jsPDF`, um slide por página (`src/lib/export/pdf.ts`).
    - PNG em lote compactado com `jszip` (`src/lib/export/image.ts`).

## Falhas e limites

- **Erro na chamada ao modelo** (rede, timeout ou JSON irrecuperável): a server function
  devolve o deck de demonstração com um aviso. A interface nunca fica sem resultado. O
  erro é registrado no log do servidor com o modelo, a etapa em que falhou e a duração.
- **Rate limit** (`src/lib/rate-limit.ts`).
  - Janela fixa por IP, em memória, aplicada só quando há chave de API.
  - Ao exceder o limite, o usuário recebe a prévia local.
  - Se o IP não puder ser identificado, a requisição é liberada.
- **Rastro da geração.**
  - Cada deck guarda em `aiTrace` o prompt enviado, a resposta bruta e o reparo, quando
    houver.
  - A rota `/bastidores` mostra esse rastro, para fins acadêmicos e de depuração.

## Texto bíblico

- O padrão é a tradução Almeida, de domínio público, servida por `bible-api.com` sem token.
- NVI, ARA e ACF são protegidas por direitos autorais e passam pela API da abibliadigital.
  Elas só são usadas quando o servidor define `BIBLE_LICENSED_ENABLED=true` e um token.
  Fora isso, o app usa Almeida.
- As respostas ficam em cache por processo. Cada busca tem timeout e uma nova tentativa.

## Persistência e contas

- Sem Supabase configurado, o histórico fica no `localStorage`, na chave
  `visio-divina:history`, com até 12 apresentações.
- Com Supabase:
  - `src/lib/auth/auth-context.tsx` oferece login e cadastro por e-mail e senha;
  - `src/lib/storage/deck-repository.ts` salva na tabela `decks`. Cada linha guarda o deck
    inteiro em `data` (jsonb), e o RLS restringe o acesso ao dono da linha.
- No primeiro login, as apresentações locais são copiadas para a conta.
- O schema está em `supabase/migrations/0001_init_decks.sql`.

## Deploy

- `vite.config.ts` escolhe o preset do nitro pelo ambiente:
  - `node-server` quando `BUILD_TARGET=node`, usado pelo Dockerfile;
  - `vercel` quando a variável `VERCEL` existe.
- `src/server.ts` envolve o handler do TanStack Start. Quando há erro não tratado na
  renderização, devolve uma página de erro em português.

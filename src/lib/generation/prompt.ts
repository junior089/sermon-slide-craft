import type { GenerationInput } from "@/lib/generation/schemas";
import type { ResolvedScripture } from "@/lib/bible/scripture";
import { MOTIF_VOCABULARY } from "@/lib/generation/motifs";
import { MOOD_VOCABULARY } from "@/lib/generation/moods";
import { TEMPLATE_DECISION_GUIDE, TEMPLATE_LABEL } from "@/lib/slide-presets";

const STYLE_LABEL: Record<GenerationInput["style"], string> = {
  "culto-principal":
    "Culto principal — pastoral, congregacional, com tese clara, texto bíblico, desenvolvimento, aplicação e resposta. Ritmo médio, slides de leitura pública.",
  "estudo-biblico":
    "Estudo bíblico — didático e expositivo. Deve abrir MAIS slides: contexto, observações do texto, evidências, explicações, conexões bíblicas, sínteses e aplicações. Não comprima o conteúdo.",
  jovens:
    "Culto de jovens — direto, contemporâneo e forte. Frases memoráveis, contraste, aplicações práticas e slides de impacto. Menos explicação longa, mais decisão e clareza.",
  conferencia:
    "Conferência — articulada e progressiva. Organize em blocos/sessões, com transições, tese, sínteses parciais, destaques e fechamento de resposta.",
};

const DENSITY_LABEL: Record<GenerationInput["density"], string> = {
  direto:
    "Síntese máxima. Poucos slides, frases curtas, 1 ideia por slide, quase sem explicações. Use destaques fortes e aplicações diretas.",
  equilibrado:
    "Equilíbrio entre clareza e profundidade. Quantidade média de slides, alternando pontos, versículos, tese e aplicação.",
  detalhado:
    "Modo detalhado. Gere MAIS slides, não slides cheios. Separe contexto, argumento, evidência bíblica, explicação, chave, implicação e aplicação. Use mais transições e sínteses parciais.",
};

const STYLE_STRUCTURE: Record<GenerationInput["style"], string> = {
  "culto-principal":
    "Estrutura esperada: capa → texto-base → tese → 2 a 4 blocos de desenvolvimento → aplicações práticas → resposta/oração. Inclua 2 a 3 slides de destaque quando o conteúdo permitir.",
  "estudo-biblico":
    "Estrutura esperada: capa → objetivo do estudo → texto-base → contexto → observações do texto → explicação verso/ponto → evidências bíblicas → chaves teológicas → perguntas/aplicações → síntese final. Para cada ponto relevante, gere mais de um slide se houver material.",
  jovens:
    "Estrutura esperada: capa forte → tensão/pergunta → texto bíblico → tese curta → blocos diretos → frases de impacto → aplicações concretas → chamada. Evite excesso de bullets explicativos.",
  conferencia:
    "Estrutura esperada: capa → tese macro → blocos nomeados → transições claras → destaques memoráveis → sínteses de bloco → chamada final. Dê ritmo de sessão, não apenas uma lista.",
};

const DENSITY_STRUCTURE: Record<GenerationInput["density"], string> = {
  direto:
    "Use de 1 a 2 slides por ideia principal. Priorize statement/points curtos. Corte explicações secundárias.",
  equilibrado:
    "Use de 2 a 3 slides por ideia principal quando houver conteúdo. Alterne explicação, texto bíblico e aplicação.",
  detalhado:
    "Use de 3 a 5 slides por ideia principal quando houver conteúdo: contexto, evidência, explicação, chave e aplicação. Se houver blocos Ciência/Bíblia/Chave, trate cada parte em slide próprio.",
};

const DISPLAY_LABEL: Record<GenerationInput["displayMode"], string> = {
  telao:
    "TELÃO (padrão) — projeção em igreja de grande área. O texto precisa ser GRANDE e ENXUTO para leitura a longa distância. " +
    "Títulos com no máximo ~6 palavras. No máximo 3 bullets por slide, cada um com no máximo ~6 palavras (~40 caracteres). " +
    "Prefira muitos slides curtos a poucos slides cheios. Quebre listas longas em vários slides.",
  tela: "TELA/TRANSMISSÃO — monitores, TVs e lives. Equilíbrio: até 5 bullets por slide, frases médias e legíveis.",
  impressao:
    "IMPRESSÃO/PDF — leitura próxima. Pode haver mais conteúdo por slide (até 6 bullets), com um pouco mais de contexto.",
};

const RESPONSE_SCHEMA = `{
  "title": "string",
  "summary": "string (1 a 3 frases)",
  "estimatedDurationMinutes": number,
  "creativeDirection": {
    "centralTheme": "string — tema central específico do roteiro",
    "sermonThesis": "string — tese da mensagem em 1 frase fiel ao roteiro",
    "biblicalAnchor": "string opcional — texto-base principal se houver",
    "sermonMovement": "exposicao | ensino | consolo | confronto | convite | celebracao",
    "emotionalArc": ["string", "..."],
    "pastoralTone": "string — tom pastoral recomendado",
    "visualRationale": "string — por que o visual recomendado combina com a mensagem",
    "recommendedTemplate": "cinematic | worship | scripture | bold | minimal | aurora | slate | dawn | tide | mono | majesty | horizon",
    "recommendedMood": "solene | consolo | celebracao | ensino | adoracao | chamada",
    "recommendedMotifs": ["string", "..."],
    "avoidVisuals": ["string", "..."]
  },
  "mood": "string — um dos tons emocionais do vocabulário",
  "motifs": ["string", "..."],
  "slides": [
    {
      "id": "s-1",
      "type": "title | topic | verse | reflection | application | conclusion",
      "layout": "cover | statement | scripture | points | quote | closing",
      "highlight": false,
      "title": "string",
      "subtitle": "string opcional",
      "bullets": ["string", "..."],
      "verse": "string opcional — em scripture DEIXE VAZIO (o sistema preenche pela referência); em quote use a frase da citação",
      "reference": "string (referência bíblica no formato 'Livro Capítulo:Versículo', ex.: 'Daniel 3:17')",
      "speakerNote": "string curta para o operador de mídia",
      "visualHint": "string curta",
      "motif": "string opcional — uma das chaves do vocabulário de motivos",
      "motifTreatment": "watermark | horizon | ornament | texture (opcional)",
      "mood": "string opcional — tom emocional deste slide (herda o do deck se ausente)",
      "rhetoricalRole": "abertura | texto_base | tese | explicacao | transicao | aplicacao | apelo | fechamento (opcional)",
      "visualRole": "hero | leitura | ensino | impacto | respiro | resposta (opcional)",
      "visualDirection": {
        "atmosphere": "solene | leve | urgente | contemplativo | didatico (opcional)",
        "background": "sem_imagem | textura | paisagem | luz | simbolo (opcional)",
        "symbol": "string opcional — uma chave de motivo",
        "treatment": "watermark | horizon | ornament | texture (opcional)",
        "intensity": "baixo | medio | alto (opcional)"
      }
    }
  ]
}`;

const MINIMAL_RESPONSE_EXAMPLE = `{
  "title": "Confiança em Deus",
  "summary": "A mensagem apresenta a confiança em Deus como resposta de fé diante da pressão.",
  "estimatedDurationMinutes": 12,
  "creativeDirection": {
    "centralTheme": "Confiança em Deus em tempos de pressão",
    "sermonThesis": "A fé permanece obediente porque Deus continua presente mesmo quando a pressão aumenta.",
    "biblicalAnchor": "Daniel 3:17",
    "sermonMovement": "consolo",
    "emotionalArc": ["pressão", "presença", "resposta de fé"],
    "pastoralTone": "Firme, esperançoso e pastoral.",
    "visualRationale": "A mensagem fala de fé sob pressão; um visual solene com motivo fogo reforça a fornalha sem transformar o símbolo em ilustração literal.",
    "recommendedTemplate": "cinematic",
    "recommendedMood": "solene",
    "recommendedMotifs": ["fogo"],
    "avoidVisuals": ["celebração leve", "imagens triunfalistas fora do roteiro"]
  },
  "mood": "solene",
  "motifs": ["fogo"],
  "slides": [
    {
      "id": "s-1",
      "type": "title",
      "layout": "cover",
      "highlight": true,
      "title": "Confiança em Deus",
      "subtitle": "Fé em tempos difíceis",
      "bullets": [],
      "speakerNote": "Abrir a mensagem com pausa e clareza.",
      "visualHint": "abertura solene",
      "rhetoricalRole": "abertura",
      "visualRole": "hero",
      "visualDirection": { "atmosphere": "solene", "background": "simbolo", "symbol": "fogo", "treatment": "watermark", "intensity": "medio" }
    },
    {
      "id": "s-2",
      "type": "topic",
      "layout": "points",
      "highlight": false,
      "title": "A fé permanece firme",
      "bullets": ["Mesmo sob pressão", "Deus continua presente", "A obediência revela confiança"],
      "speakerNote": "Avançar conforme o pregador desenvolver os pontos.",
      "visualHint": "desenvolvimento",
      "rhetoricalRole": "explicacao",
      "visualRole": "ensino"
    },
    {
      "id": "s-3",
      "type": "conclusion",
      "layout": "closing",
      "highlight": false,
      "title": "Confie e obedeça",
      "subtitle": "Uma resposta prática de fé",
      "bullets": [],
      "speakerNote": "Manter o slide durante a oração final.",
      "visualHint": "fechamento",
      "rhetoricalRole": "fechamento",
      "visualRole": "resposta"
    }
  ]
}`;

const JSON_VALIDATION_RULES = `VALIDAÇÃO DO JSON:
- Use aspas duplas em todas as chaves e strings.
- Não use trailing commas.
- Não inclua campos fora do esquema.
- Use ids sequenciais: "s-1", "s-2", "s-3"...
- Em slides sem bullets, use "bullets": [].
- Em slides que não usam verse/reference, omita esses campos ou use string vazia.
- Retorne apenas um objeto JSON, sem markdown.`;

export function buildSlidesPrompt(
  input: GenerationInput,
  scriptures: ResolvedScripture[] = [],
): {
  system: string;
  user: string;
} {
  const slideRange = estimateSlideRange(input);
  const system = `Você é o assistente editorial e litúrgico do Visio Divina, uma ferramenta usada por equipes de mídia de igrejas evangélicas para transformar roteiros de pregação em slides de PROJEÇÃO.

MISSÃO:
- Transformar o roteiro em uma apresentação clara, fiel e pronta para culto.
- Organizar o pensamento do pregador em uma sequência natural: abertura, texto bíblico, tese, desenvolvimento, aplicação e fechamento.
- Escrever para leitura pública em tela: frases fortes, poucas palavras e uma ideia por slide.

REGRAS INVIOLÁVEIS:
- Não escreva o TEXTO de versículos bíblicos de memória. Para slides de versículo, informe a REFERÊNCIA (ex.: "João 3:16") no campo "reference" e deixe "verse" vazio — o sistema insere automaticamente o texto bíblico oficial. (Exceção: se o roteiro já trouxer o texto exato, pode reproduzi-lo.)
- Use apenas referências bíblicas que apareçam ou estejam claramente indicadas no roteiro; não invente referências.
- Não invente tema, série, pregador, contexto histórico, ilustrações, números, datas ou citações que não estejam no conteúdo.
- Não crie doutrinas novas nem altere o sentido da mensagem original.
- Se uma informação estiver ambígua, sintetize de forma neutra em vez de completar com suposições.
- Reduza frases longas. Linguagem respeitosa, clara, pastoral e adequada a culto.
- Retorne APENAS JSON válido, sem markdown, sem comentários, sem texto antes ou depois.

QUALIDADE EDITORIAL:
- Preserve o vocabulário teológico central do pregador, mas remova repetições, muletas e frases excessivamente orais.
- Não transforme tudo em frases genéricas. Mantenha as ideias específicas do roteiro.
- Prefira verbos ativos e afirmações diretas.
- Evite jargões internos, humor fora de contexto, caixa alta excessiva e pontuação dramática.
- Cada slide deve comunicar uma única unidade de pensamento.
- Não use mais de uma frase longa no mesmo slide.

ESTUDOS COM CIÊNCIA / BÍBLIA / CHAVE:
- Quando o roteiro vier em blocos como "Ciência", "Bíblia" e "Chave", preserve essa lógica editorial.
- Para cada ponto numerado, prefira uma sequência curta:
  1. slide "points" com a ideia científica ou prática em bullets enxutos;
  2. slide(s) "scripture" para as referências bíblicas explícitas daquele bloco;
  3. slide "statement" ou "quote" com a "Chave" do bloco, quando ela existir.
- A "Chave" deve virar frase de impacto curta, fiel ao texto, sem explicação extra.
- Não misture muitos versículos no mesmo slide. Em telão, use um slide por referência importante.
- Se houver uma frase final explícita, use-a como fechamento ou slide de destaque antes do encerramento.
- Para temas de conflito interior, mente, identidade, ansiedade, cura ou batalha espiritual, mantenha tom pastoral, firme e esperançoso.

COMPOSIÇÃO DOS SLIDES (campo "layout"):
Cada slide DEVE ter um "layout" que define sua composição visual. Varie os layouts para dar ritmo à apresentação:
- "cover": abertura / título da mensagem ou série. Título forte + subtítulo curto. Sem bullets.
- "statement": FRASE DE DESTAQUE. Uma única ideia de altíssimo impacto, texto curtíssimo, sem bullets. Use para a tese central e momentos-chave.
- "scripture": SOMENTE TEXTO BÍBLICO. Informe a "reference" (ex.: "João 3:16") e deixe "verse" VAZIO — o sistema preenche o texto oficial. Se o roteiro já trouxer o texto exato, pode colocá-lo em "verse". Sem bullets. O "title" deve ser a referência.
- "points": título + lista de tópicos (campo "bullets"). Use para desenvolvimento e aplicações.
- "quote": reflexão ou citação centralizada (use "verse" para a frase e "subtitle" para a autoria, se houver). Sem bullets.
- "closing": fechamento, recapitulação ou chamada à ação. Título + subtítulo curtos.

DESTAQUE (campo "highlight"):
- Marque "highlight": true nos slides mais importantes: tese central, versículo-chave, chave teológica, síntese de bloco ou convite final.
- Em modo direto/culto simples, use 1 a 2 destaques. Em estudo bíblico, conferência ou síntese detalhada, use 2 a 4 destaques quando houver conteúdo suficiente.
- Nunca marque todos os slides como destaque.

ANCORAGEM NO TEXTO BÍBLICO (PROFUNDIDADE):
- Quando forem fornecidos "TEXTOS BÍBLICOS DA PASSAGEM" no conteúdo do usuário, LEIA-OS com atenção antes de escrever.
- Faça a tese, as frases de destaque (statement), os títulos-chave e as aplicações ECOAREM o vocabulário, as imagens e o movimento dessas passagens — não escreva de forma genérica que serviria para qualquer pregação.
- Escolha "mood" e "motifs" sustentados por esses textos, não por palavra solta.
- Mesmo tendo o texto à vista, nos slides de versículo continue informando a "reference" e deixando "verse" VAZIO: o sistema reinsere o texto oficial. Os textos fornecidos servem para você COMPREENDER e escrever fiel à passagem, não para copiar.

TEXTO BÍBLICO:
- Para cada referência bíblica citada no roteiro, crie um slide "scripture" com a "reference" preenchida e "verse" VAZIO — o sistema insere o texto oficial (tradução Almeida) automaticamente.
- NÃO escreva o texto do versículo de memória; confie na referência. Exceção: se o roteiro trouxer o texto exato do versículo, pode reproduzi-lo em "verse".
- Formato da referência: "Livro Capítulo:Versículo" (ex.: "Daniel 3:17"). Intervalos são aceitos (ex.: "João 3:16-17").
- Não invente referências que não estejam no roteiro.
- Se NÃO houver nenhuma referência bíblica no roteiro, NÃO crie slides "scripture".

CAPA E ENCERRAMENTO (OBRIGATÓRIOS):
- O PRIMEIRO slide DEVE ser uma CAPA (layout "cover", type "title"): título da mensagem como destaque.
  Se houver série e/ou pregador informados nas configurações, o slide é a abertura da mensagem — NÃO repita esses dados nos bullets; eles são exibidos automaticamente pelo template.
- O ÚLTIMO slide DEVE ser um ENCERRAMENTO (layout "closing", type "conclusion"): recapitulação ou chamada final, curto.
- A capa não deve ter bullets, verse ou reference.
- O encerramento deve soar como conclusão pastoral ou chamada à resposta, sem inventar apelos que contradigam o roteiro.

QUANTIDADE DE SLIDES (DINÂMICA):
- NÃO existe número fixo. DECIDA a quantidade pelo TAMANHO e RIQUEZA do conteúdo enviado.
- Texto curto → poucos slides; texto longo/denso → mais slides. Cada slide carrega UMA ideia.
- Em TELÃO, prefira MUITOS slides curtos a poucos slides cheios. Quebre listas e raciocínios longos em vários slides.
- Nunca encha um slide para "economizar" slides. Respeite os limites de bullets do alvo de exibição.
- Para roteiro muito curto, ainda gere no mínimo capa, desenvolvimento e encerramento.
- IMPORTANTE: "detalhado" e "estudo bíblico" significam MAIS SLIDES e mais separação editorial, não bullets longos.
- Se o roteiro tiver pontos numerados, cada ponto relevante deve virar um pequeno conjunto de slides, não apenas um bullet.
- Se houver evidências, explicações, exemplos, "Ciência", "Bíblia", "Chave", perguntas ou aplicações, separe essas partes em slides diferentes.
- Prefira 18 slides claros a 8 slides apertados quando o conteúdo for denso.

LEGIBILIDADE:
- Títulos devem ser curtos, memoráveis e específicos.
- Bullets não são parágrafos: devem ser fragmentos claros, não transcrições extensas.
- Evite repetir o título dentro dos bullets.
- Não use numeração nos bullets, a menos que o roteiro traga uma lista numerada essencial.
- Não coloque quebras de linha dentro de strings.

SEQUÊNCIA: capa (cover) → desenvolvimento (points/scripture/quote/statement) → aplicação (points) → encerramento (closing).
Use os "type": title, topic, verse, reflection, application, conclusion (coerentes com o layout).

NOTAS PARA OPERADOR:
- "speakerNote" deve orientar a equipe de mídia de modo prático: entrada do slide, pausa, ênfase, momento de leitura, resposta congregacional ou transição.
- Se as notas forem solicitadas, todos os slides devem ter speakerNote útil e curta.
- Se não forem solicitadas, ainda preencha speakerNote com uma orientação mínima e objetiva.

HINT VISUAL:
- "visualHint" deve indicar bloco, tom visual ou função do slide, sem pedir imagens externas específicas.
- Exemplos úteis: "abertura solene", "leitura bíblica", "tese central", "aplicação prática", "fechamento".

DIREÇÃO CRIATIVA / TEMPLATE:
- Antes de escrever os slides, faça uma leitura pastoral e visual do roteiro em "creativeDirection".
- "centralTheme" e "sermonThesis" devem ser específicos do roteiro. Se servirem para qualquer pregação, reescreva.
- "sermonMovement" deve indicar o movimento dominante: exposição, ensino, consolo, confronto, convite ou celebração.
- "visualRationale" deve explicar em 1 frase por que o template/mood/motifs recomendados combinam com a mensagem.
- "avoidVisuals" deve listar imagens, tons ou abordagens que poderiam distorcer o sentido da mensagem.
- A beleza visual nunca deve introduzir símbolos que mudem o sentido da mensagem. Use apenas símbolos sustentados pelo texto, pela passagem bíblica ou pelo tema explicitamente informado.
- Recomende UM template base em "recommendedTemplate" usando este guia:
${TEMPLATE_DECISION_GUIDE}

MOTIVOS VISUAIS (símbolos concretos da passagem):
- Identifique os 1 a 3 SÍMBOLOS centrais da mensagem e liste-os em "motifs" (nível do deck).
- Use APENAS chaves deste vocabulário fechado (não invente outras): ${MOTIF_VOCABULARY}.
- Escolha pelo sentido do texto, não por palavra solta: "multiplicação dos pães e peixes" → ["pao","peixe"]; "andar sobre as águas"/"tempestade no mar" → ["mar"] (ou "ondas"/"tempestade"); "fornalha"/"línguas de fogo" → ["fogo"]; "a videira verdadeira" → ["videira"]; "parábola do semeador" → ["semente","trigo"].
- Se NENHUM símbolo for claramente dominante, retorne "motifs": [] (não force).
- "motif" por slide é OPCIONAL: use só em slides-chave (capa, clímax/destaque, versículo central) quando um símbolo específico reforçar AQUELE slide. Os demais slides herdam o motivo do deck automaticamente — não repita em todos.
- Contenção: motivo é atmosfera de fundo, não ilustração literal. Prefira o ambiente (mar, monte, luz) ao objeto isolado.

TOM EMOCIONAL (mood):
- Defina "mood" (nível do deck) com o tom DOMINANTE da mensagem, usando APENAS o vocabulário: ${MOOD_VOCABULARY}.
- Escolha pela emoção central, não por palavra solta. Ex.: juízo/santidade/fornalha → "solene"; cura/ansiedade/perdão → "consolo"; gratidão/vitória/provisão → "celebracao"; doutrina/parábola/exposição → "ensino"; intimidade/entrega/presença → "adoracao"; decisão/missão/convite → "chamada".
- "mood" por slide é OPCIONAL: use só para marcar uma VIRADA de tom (ex.: um clímax de adoração no meio de um ensino). Não repita em todos os slides — os demais herdam o mood do deck.
- Se o tom não for claro, pode omitir "mood".

DIREÇÃO VISUAL POR SLIDE ("visualDirection"):
- Preencha "visualDirection" nos SLIDES-CHAVE (capa, tese/statement, versículo central, destaque, encerramento). Nos slides comuns de desenvolvimento pode omitir — eles herdam a atmosfera do deck.
- "atmosphere" = peso/luz do slide, coerente com o momento: "solene" (reverência/juízo), "contemplativo" (consolo/adoração), "leve" (graça/celebração), "urgente" (chamada/decisão), "didatico" (ensino/exposição — sem dramatizar).
- "background" = como o fundo se comporta: "sem_imagem" (slide limpo, foco no texto — bom para tese e aplicação), "simbolo" (deixa o motivo aparecer — bom para capa e versículo-chave), "luz" (claridade suave), "textura" (discreta), "paisagem" (horizonte). Na dúvida, use "sem_imagem".
- "symbol" (opcional) = uma chave do vocabulário de motivos quando AQUELE slide pede um símbolo específico; "intensity" = baixo/medio/alto (use "alto" só em clímax).
- Coerência: a atmosfera deve combinar com o mood e com o que está sendo dito naquele slide — nunca contrariar o sentido da passagem.

${JSON_VALIDATION_RULES}

ESQUEMA DE RESPOSTA (JSON):
${RESPONSE_SCHEMA}

EXEMPLO MÍNIMO DE FORMATO:
${MINIMAL_RESPONSE_EXAMPLE}

Use o exemplo apenas como referência de formato. Não copie o conteúdo dele.`;

  const flags: string[] = [];
  if (input.highlightVerses)
    flags.push('Priorizar slides "scripture" para cada versículo encontrado no texto.');
  if (input.generateOperatorNotes)
    flags.push(
      "Preencher speakerNote em todos os slides com instruções práticas para o operador de mídia.",
    );
  if (input.suggestBlocks)
    flags.push(
      "Indicar no visualHint a divisão em blocos (abertura, desenvolvimento, aplicação, fechamento).",
    );

  const user = `CONFIGURAÇÕES:
- Quantidade de slides: DECIDA pelo tamanho/conteúdo do texto (não há número fixo).
- Faixa recomendada pelo sistema para este roteiro/configuração: ${slideRange.min} a ${slideRange.max} slides. Ficar abaixo disso só se o roteiro realmente não tiver conteúdo suficiente.
- Estilo: ${STYLE_LABEL[input.style]}
- Estrutura do estilo: ${STYLE_STRUCTURE[input.style]}
- Nível de síntese: ${DENSITY_LABEL[input.density]}
- Regra prática da síntese: ${DENSITY_STRUCTURE[input.density]}
- ALVO DE EXIBIÇÃO: ${DISPLAY_LABEL[input.displayMode]}
${input.preferredTemplate ? `- Template visual preferido: ${TEMPLATE_LABEL[input.preferredTemplate]} (${input.preferredTemplate})` : ""}
${input.templateLocked ? "- Template travado pelo usuário: respeite essa escolha como base visual, mas ainda explique se haveria alternativa mais coerente." : "- Template não travado: recomende o template mais coerente com a mensagem em creativeDirection.recommendedTemplate."}
${input.theme?.trim() ? `- Tema indicado pelo pregador: ${input.theme.trim()}` : ""}
${input.series?.trim() ? `- Série de pregações: ${input.series.trim()} (contexto para a capa; não repita nos bullets)` : ""}
${input.preacher?.trim() ? `- Pregador: ${input.preacher.trim()} (contexto para a capa; não repita nos bullets)` : ""}
${flags.length ? `- Diretrizes adicionais:\n  • ${flags.join("\n  • ")}` : ""}

CONTEÚDO TEOLÓGICO ORIGINAL:
"""
${input.text.trim()}
"""
${
  scriptures.length
    ? `\nTEXTOS BÍBLICOS DA PASSAGEM (tradução Almeida — referências detectadas no roteiro, já resolvidas):
Use a LINGUAGEM e as IMAGENS destes textos para escrever tese, statements, títulos e aplicações fiéis à passagem. Nos slides de versículo, ainda assim deixe "verse" VAZIO (o sistema reinsere o texto oficial).
${scriptures.map((s) => `- ${s.reference}: "${s.text}"`).join("\n")}\n`
    : ""
}

TAREFA:
1. Leia o roteiro e identifique título provável, tema central, textos bíblicos explícitos, pontos principais e aplicações.
2. Antes de montar os slides, defina "creativeDirection": tese da mensagem, movimento pastoral, arco emocional, tom, template recomendado, mood, motifs e o que evitar visualmente.
3. Monte uma sequência de slides com começo, progressão e fechamento, guiada por essa direção criativa.
4. Ajuste a densidade ao alvo de exibição e ao nível de síntese.
5. Varie os layouts apenas quando isso ajudar a compreensão.
6. Antes de responder, confira se a quantidade de slides ficou coerente com a faixa recomendada. Se ficou curta demais, divida ideias densas em mais slides.
7. Revise mentalmente se o JSON é válido e se todos os slides respeitam o esquema.

Gere a apresentação seguindo todas as regras. Responda APENAS com o JSON.`;

  return { system, user };
}

function estimateSlideRange(input: GenerationInput): { min: number; max: number } {
  const words = input.text.trim() ? input.text.trim().split(/\s+/).length : 0;
  const densityDivisor =
    input.density === "direto" ? 95 : input.density === "equilibrado" ? 70 : 45;
  const styleMultiplier =
    input.style === "estudo-biblico"
      ? 1.35
      : input.style === "conferencia"
        ? 1.18
        : input.style === "jovens"
          ? 0.95
          : 1;
  const displayMultiplier =
    input.displayMode === "telao" ? 1.18 : input.displayMode === "impressao" ? 0.92 : 1;
  const base = Math.ceil((words / densityDivisor) * styleMultiplier * displayMultiplier) + 4;
  const minByMode =
    input.density === "detalhado" || input.style === "estudo-biblico"
      ? 10
      : input.density === "equilibrado"
        ? 7
        : 5;
  const min = Math.max(minByMode, Math.min(36, Math.round(base * 0.82)));
  const max = Math.max(min + 3, Math.min(60, Math.round(base * 1.35)));
  return { min, max };
}

export function buildJsonRepairPrompt(
  rawResponse: string,
  validationError?: string,
): {
  system: string;
  user: string;
} {
  return {
    system: `Você corrige saídas de IA para JSON válido do Visio Divina.

REGRAS:
- Preserve o conteúdo útil da resposta original.
- Não invente novos slides nem novas informações teológicas.
- Corrija apenas formato, chaves, tipos, vírgulas, arrays e campos incompatíveis.
- Se algum campo obrigatório estiver ausente, preencha com uma versão curta baseada no próprio conteúdo existente.
- Retorne APENAS JSON válido.

${JSON_VALIDATION_RULES}

ESQUEMA ESPERADO:
${RESPONSE_SCHEMA}`,
    user: `ERRO DE VALIDAÇÃO:
${validationError || "A resposta não pôde ser interpretada como JSON válido."}

RESPOSTA ORIGINAL A CORRIGIR:
"""
${rawResponse.trim()}
"""

Corrija a resposta para obedecer exatamente ao esquema e retorne apenas o JSON.`,
  };
}

// Modelos sem saída estruturada costumam envolver o JSON em markdown ou texto.
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // segue para a próxima tentativa
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      // segue para a próxima tentativa
    }
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      // sem JSON recuperável
    }
  }
  throw new Error("Resposta da IA não contém JSON válido.");
}

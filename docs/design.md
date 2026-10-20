# Padrão visual

O Visio Divina tem duas camadas visuais independentes: a interface da aplicação e os
templates dos slides. Elas não compartilham tokens de propósito, para que uma mudança na
interface não altere a aparência de uma apresentação já criada.

## Interface

Os tokens ficam em `:root`, no início de `src/styles.css`, e são expostos ao Tailwind pelo
bloco `@theme inline`.

| Papel          | Token                                 | Valor                 |
| -------------- | ------------------------------------- | --------------------- |
| Fundo          | `--background`                        | `#ffffff`             |
| Superfície     | `--surface` / `--surface-alt`         | `#eeece7` / `#f7f6f3` |
| Texto          | `--foreground` / `--muted-foreground` | `#212121` / `#616161` |
| Ação principal | `--primary`                           | `#17171c`             |
| Destaque       | `--gold`                              | `#ff7759`             |
| Faixas escuras | `--band-green` / `--band-navy`        | `#003c33` / `#071829` |
| Borda e foco   | `--border` / `--ring`                 | `#d9d9dd` / `#4c6ee6` |

- A interface só tem tema claro.
- Raios: 4, 8, 16, 22 e 30 px (`--radius-xs` a `--radius-xl`), e 32 px nos botões em pílula.
- Tipografia:
  - Space Grotesk nos títulos (`--font-display`);
  - Inter no texto corrido (`--font-sans`);
  - Fraunces nos templates com serifa (`--font-serif`).
- As fontes são empacotadas com `@fontsource` (importadas em `src/router.tsx`). Assim a
  exportação para imagem consegue embuti-las sem depender de rede.
- Utilitários de texto: `t-hero`, `t-section`, `t-card`, `t-body-lg` e `u-eyebrow`. As
  faixas escuras de largura total usam `band` e `band-navy`.

## Templates de slide

Os templates são classes `.tpl-*` no final de `src/styles.css`. Os metadados que aparecem
na galeria e no prompt ficam em `src/lib/slide-presets.ts`.

| Chave       | Nome      | Linguagem visual                 |
| ----------- | --------- | -------------------------------- |
| `cinematic` | Cinema    | Preto com brilho dourado         |
| `worship`   | Louvor    | Gradiente índigo                 |
| `aurora`    | Aurora    | Verde-azulado moderno            |
| `bold`      | Impacto   | Gradiente quente, título grande  |
| `slate`     | Ensino    | Grafite sóbrio, editorial        |
| `scripture` | Palavra   | Creme com serifa clássica        |
| `minimal`   | Sereno    | Branco editorial                 |
| `dawn`      | Alvorada  | Âmbar e creme                    |
| `tide`      | Maré      | Ciano elétrico, tom jovem        |
| `mono`      | Contraste | Monocromático, tipografia grande |
| `majesty`   | Majestade | Borgonha, tom de conferência     |
| `horizon`   | Horizonte | Gradiente amplo                  |

O template define a paleta. A composição de cada slide vem do layout:

- `cover`: abertura;
- `statement`: frase de destaque;
- `scripture`: texto bíblico;
- `points`: título e tópicos;
- `quote`: citação;
- `closing`: encerramento.

Sobre isso se aplicam duas camadas opcionais:

- **Tom emocional** (`mood`, em `moods.ts`): ajusta a atmosfera.
- **Motivo visual** (`motif`, em `motifs.ts`): um símbolo da passagem, como pão, mar ou
  fogo, desenhado em SVG com pouca opacidade.

O slide é desenhado em 1920×1080 e escalado para caber na tela. Por isso o mesmo
componente serve para o editor, o modo apresentação e a exportação.

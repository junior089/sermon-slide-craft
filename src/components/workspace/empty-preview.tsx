import { SlideCanvas } from "@/components/slide-canvas";
import type { Slide, SlideTemplate } from "@/types/slides";

const PREVIEW_SLIDES: Array<{ slide: Slide; template: SlideTemplate }> = [
  {
    template: "cinematic",
    slide: {
      id: "preview-cover",
      type: "title",
      layout: "cover",
      highlight: true,
      title: "A fé no meio do fogo",
      subtitle: "Daniel 3",
      bullets: [],
      speakerNote: "",
      visualHint: "",
    },
  },
  {
    template: "aurora",
    slide: {
      id: "preview-points",
      type: "application",
      layout: "points",
      title: "Três respostas da fé",
      subtitle: "Para atravessar pressão sem perder adoração",
      bullets: ["Confia antes de ver", "Permanece junto", "Testemunha com clareza"],
      speakerNote: "",
      visualHint: "",
    },
  },
  {
    template: "scripture",
    slide: {
      id: "preview-verse",
      type: "verse",
      layout: "scripture",
      highlight: true,
      title: "Daniel 3.17",
      reference: "Daniel 3.17",
      verse: "O nosso Deus, a quem servimos, pode livrar-nos.",
      bullets: [],
      speakerNote: "",
      visualHint: "",
    },
  },
];

export function EmptyPreview() {
  return (
    <div className="preview-empty-stage flex h-full min-h-[680px] flex-col gap-6 rounded-lg border border-border p-6 md:p-8">
      <div>
        <span className="u-eyebrow !text-[0.6rem]">Prévia</span>
        <h2 className="u-display mt-3 text-3xl leading-none">Sua apresentação aparece aqui</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Cole o roteiro ao lado e gere uma sequência pronta para projeção — capa, texto bíblico,
          tópicos e encerramento. Abaixo, um exemplo do resultado.
        </p>
      </div>

      <div className="empty-preview-hero">
        <SlideCanvas
          slide={PREVIEW_SLIDES[0].slide}
          template={PREVIEW_SLIDES[0].template}
          displayMode="telao"
          index={0}
          total={3}
          series="Série: Fornalha"
          preacher="Pr. Exemplo"
          showChrome={false}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {PREVIEW_SLIDES.slice(1).map(({ slide, template }, index) => (
          <SlideCanvas
            key={slide.id}
            slide={slide}
            template={template}
            displayMode="telao"
            index={index + 1}
            total={3}
            showChrome={false}
            className="empty-preview-card"
          />
        ))}
      </div>

      <div className="mt-auto border-t border-border pt-5">
        <span className="u-eyebrow !text-[0.55rem] text-muted-foreground">Como funciona</span>
        <ol className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-3">
          <Step n={1} title="Cole o roteiro" desc="Notas, esboço ou estudo teológico." />
          <Step n={2} title="Escolha o visual" desc="Tema, formato e marca da igreja." />
          <Step n={3} title="Gere e revise" desc="Slide a slide, e exporte." />
        </ol>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.68rem] font-medium text-primary-foreground">
        {n}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
    </li>
  );
}

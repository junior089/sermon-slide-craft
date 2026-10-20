# Roadmap

Itens pendentes, em ordem de prioridade. O que já foi entregue está descrito em
[arquitetura.md](arquitetura.md).

## Prioridade alta

1. **Quota por usuário na geração.**
   - Com Supabase configurado, a geração com o modelo já exige login e tem rate limit
     por IP.
   - O limite fica em memória e vale por processo: não sobrevive a um restart nem é
     compartilhado entre instâncias.
   - O próximo passo é uma quota diária por usuário, persistida no banco.
2. **Migrations versionadas.**
   - A tabela `decks` é criada colando o SQL de `supabase/migrations` no painel.
   - O próximo passo é usar a CLI do Supabase (`supabase db push`) e separar os
     ambientes.
3. **Observabilidade.**
   - As falhas de geração já são registradas no log do servidor com modelo, etapa e
     duração.
   - Falta enviar esses eventos para um serviço de monitoramento e acompanhar a taxa de
     fallback para a prévia local.

## Prioridade média

4. **Streaming da geração.**
   - A chamada usa `generateText` e o usuário espera a resposta inteira.
   - Com `streamText`, os slides apareceriam conforme chegam.
5. **Exportação para softwares de projeção.** ProPresenter, OpenLP e EasyWorship, que são
   os programas usados pelas equipes de mídia.
6. **Visão do apresentador em segunda tela.** O slide atual no projetor; o próximo slide,
   as notas e um cronômetro no monitor do operador.
7. **Importar roteiro de `.docx` e `.pdf`.**
8. **Compartilhar apresentação por link**, somente leitura.
9. **Renderizar os motivos visuais sem `dangerouslySetInnerHTML`.**
   - Hoje o SVG vem de um registro interno e o uso é seguro.
   - Um componente tipado elimina o risco caso a origem mude.

## Prioridade baixa

10. **Espaços de equipe**, com biblioteca compartilhada por igreja e papéis de acesso.
11. **Modo louvor**, com slides de letra de música.
12. **Biblioteca de imagens de fundo.** O campo `backgroundImage` já existe no slide.
13. **Fundo em gradiente e motivos no PPTX.** O `pptxgenjs` só aceita cor sólida.
14. **Auditoria de acessibilidade** (contraste, foco e navegação por teclado), com atenção
    ao modo apresentação.
15. **PWA com uso offline e histórico de versões** de cada apresentação.

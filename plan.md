# GRID SOUL — Agente local autorizado

## Abordagem

Evoluir o app Node.js/Express já existente sem alterar a renderização Three.js, o enxame de microcubos nem a ponte visual com ChatGPT. A automação roda somente no processo local do GRID SOUL, servido em `127.0.0.1`; não será implantada em serviço hospedado e nenhuma alteração será enviada ao GitHub. O backup integral anterior à edição está em `../GRID-SOUL-PRONTO.backup-20261021-1645`.

Adicionar um módulo Express independente para permissões e tarefas locais. Todas as categorias (`terminal`, `files`, `apps`, `browser`) começam desativadas; escopos de arquivos são pastas explicitamente concedidas e escopos Web são origens HTTPS exatas. A execução CLI usa `spawn` sem shell, com catálogo de comandos somente leitura e argumentos validados; operações de arquivos usam raízes explícitas, proteção contra traversal/symlinks e bloqueio de arquivos de credenciais. Escritas, renames, exclusões, abertura de programas, navegações, leitura de texto visível, preenchimentos e cliques no navegador aguardam aprovação específica e de curta duração. Tarefas são canceláveis, permissões revogáveis e revogação/STOP esperam a finalização dos executores ativos.

Playwright usa contexto isolado, temporário e sem cookies/perfis existentes; origens são concedidas individualmente e um proxy efêmero resolve DNS e fixa cada conexão ao IP público validado; destinos locais/privados são bloqueados. Autenticação manual fica sob controle do usuário e campos de senha não podem ser preenchidos por automação. Atividade e progresso são transmitidos via SSE. O log de auditoria guarda apenas metadados minimizados (sem valores de formulários, conteúdo de página, saída de comandos ou argumentos sensíveis), com arquivos locais ignorados pelo Git e modo restrito. Processos usam ambiente reduzido, mas executam sob a conta do usuário e não são isolados por sandbox de kernel.

## Estrutura

- `server.js`: servidor atual e registro do novo roteador, ainda limitado ao loopback.
- `lib/automation/policy.js`: política pura para comandos, caminhos, origens e dados sensíveis.
- `lib/automation/store.js`: persistência local de permissões, escopos e auditoria minimizada.
- `lib/automation/service.js`: APIs, aprovação explícita, processos controlados, cancelamento aguardado, eventos SSE e Playwright.
- `lib/automation/network-proxy.js`: túnel HTTPS efêmero com pinagem de DNS e bloqueio de rede privada.
- `public/index.html` e `public/automation-ui.js`: interface 3D existente e painel sobreposto, com consentimento e estado em tempo real.
- `test/`: testes de regressão atuais e novos testes de políticas, permissões, aprovação, arquivos, proxy, auditoria e cancelamento.
- `docs/SEGURANCA-AUTOMACAO.md`: limites, ameaças cobertas, concessão/revogação e execução local.

## Decisões de escopo e segurança

A autorização de um domínio não é uma autorização geral: a concessão é por origem e o usuário aprova cada navegação, extração de texto, formulário e clique. Não há execução de shell arbitrário, elevação de privilégios, importação/armazenamento de cookies ou persistência de credenciais. Comandos fora da lista segura e ações do navegador que não possam ser categorizadas são negados. O modelo de ameaça não inclui isolamento contra malware/processos maliciosos do mesmo usuário nem elimina todas as corridas TOCTOU contra uma árvore de arquivos alterada localmente; esses limites estão documentados. A edição é feita sobre a cópia extraída e com backup preservado; validação combina testes existentes, novos testes e revisão de segurança. Nenhum `git push`, publicação ou implantação será executado.

## Design

Reutilizar a estética GRID SOUL já confirmada: interface operacional de ficção científica em fundo escuro, ciano/azul, bordas discretas e tipografia do sistema, sem substituir o palco 3D. O painel é uma camada compacta e responsiva com estados claros de permissão, tarefa, confirmação, cancelamento e auditoria. A hierarquia prioriza consentimento e ação imediata de parar; textos explicam o escopo concedido sem sugerir acesso ilimitado.

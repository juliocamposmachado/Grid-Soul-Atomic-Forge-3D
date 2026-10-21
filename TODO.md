# TODO — GRID SOUL agente de automação local

## Critérios de aceitação

- [x] Evoluir o GRID SOUL para um agente local que execute ações iniciadas e autorizadas pelo usuário.
- [x] Adicionar botões e painel com terminal integrado, opção de abrir terminal nativo, execução de comandos permitidos, abertura de programas, gerenciamento de arquivos e navegador.
- [x] Implementar Playwright para navegar, pesquisar pelo conteúdo visível e interagir com páginas somente após conceder cada origem/escopo; a autenticação no contexto isolado é manual.
- [x] Exigir consentimento por categoria e confirmação individual de navegação, leitura Web, preenchimentos, cliques e mutações de arquivo; bloquear campos/arquivos sensíveis conhecidos.
- [x] Exibir progresso, saída, erros, permissões, auditoria SSE, cancelamento, parada global e revogação de escopos/categorias.
- [x] Modularizar políticas, persistência e serviço; restringir CLI a allowlist sem shell, limitar caminhos/origens, validar DNS e piná-lo em proxy, proteger dados de auditoria e bloquear endereços privados/reservados.
- [x] Preservar o palco 3D, o enxame de microcubos, a ponte de IA existente e a arquitetura compatível do servidor; a suíte preexistente de regressão continua passando.
- [x] Criar backup antes das alterações, documentação de instalação/segurança e cobertura automatizada de políticas, permissões, aprovações, auditoria e proxy.
- [x] Validar com `npm run check` e `git diff --check`; resultado final: 30 testes passaram, 0 falhas.
- [x] Não executar `git push`, publicação ou implantação; nenhum código foi publicado.

## Limites residuais documentados

- Não há sandbox de kernel: processos CLI, Chromium, navegador nativo e a API local rodam sob a conta do usuário. Um processo local malicioso do mesmo usuário não é isolado; os endpoints da extensão Chrome também não têm autenticação de processo.
- APIs portáveis de arquivo não eliminam totalmente corridas TOCTOU contra outro processo local que modifique a pasta concedida. Evite autorizar pastas graváveis por processos não confiáveis.
- O terminal nativo é deliberadamente um escape dos filtros do terminal integrado. Após abrir um aplicativo/processo externo, o GRID SOUL não consegue reverter seu efeito ou encerrá-lo com garantia.
- Texto de página pode conter informação pessoal já visível; a leitura exige confirmação, não é gravada na auditoria, fica na API em memória por até 60 segundos e pode continuar visível no cartão até recarregar/substituir a interface.
- Não foi validada uma sessão Web autenticada real nem uma instalação Chromium interativa nesta sandbox. Para login, instalar Chromium do Playwright e usar modo visível; cada origem de autenticação/CDN necessária precisa de concessão própria.
- A extensão Chrome está configurada para a porta padrão `8765`; mudar `GRID_SOUL_PORT` exige ajustar a configuração da extensão/manifesto.

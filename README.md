<img width="1352" height="763" alt="image" src="https://github.com/user-attachments/assets/d0f30848-9313-43a2-aa88-799d263660fe" />

# GRID SOUL — Enxame 3D inteligente de microcubos

**O usuário descreve a transformação. O ChatGPT interpreta o pedido. O GRID SOUL converte a resposta validada em parâmetros visuais para o enxame de microcubos.**

O GRID SOUL é uma aplicação 3D local para explorar formas, estruturas e conceitos visuais usando um enxame de microcubos. Esta documentação atualiza a descrição do projeto para refletir a interface atual, os botões adicionados e o fluxo de interação com o ChatGPT.

> **Importante:** o ChatGPT propõe um plano visual; quem renderiza a cena é o GRID SOUL. A aparência final depende dos parâmetros aceitos pelo aplicativo, da população de cubos, da energia, da câmera e dos recursos implementados.

## O que foi modificado nesta versão

A documentação anterior enfatizava principalmente a reconstrução de rosto por cubos. A interface atual também reúne comandos de transformação, controles do enxame, identidade química e atalhos para módulos especializados.

- **Campo de pedido ao ChatGPT:** permite descrever em linguagem natural a forma ou transformação desejada.
- **Enviar ao ChatGPT:** envia o pedido pela ponte local configurada, recebe a resposta e permite ao GRID SOUL validar e aplicar os parâmetros visuais reconhecidos.
- **Abrir demonstração química:** abre a demonstração relacionada à identidade química dos microcubos.
- **Abrir agente de automação local:** abre o painel de automação, com permissões e aprovações separadas.
- **Abrir Atomic Forge 3D:** abre a oficina de modelagem paramétrica e análise de uma peça.
- **População de microcubos:** ajusta a quantidade de unidades usadas para compor a forma.
- **Energia coletiva:** ajusta um parâmetro visual/comportamental do enxame.
- **Identidade química — 118 elementos:** mantém a associação dos slots aos elementos da tabela periódica.
- **Cores dos microcubos:** controla a representação visual conforme as opções disponibilizadas pela interface.
- **Mensagem de estado:** informa o resultado interpretado da transformação e resume os componentes visuais solicitados.

## Como funciona a interação com o ChatGPT

O fluxo de trabalho é:

1. O usuário escreve um pedido no campo de comando.
2. Ao clicar em **Enviar ao ChatGPT**, o GRID SOUL encaminha o texto à conversa do ChatGPT por meio da ponte local configurada.
3. O ChatGPT interpreta a intenção e retorna uma descrição/estrutura de parâmetros para a cena.
4. O GRID SOUL valida a resposta recebida e aplica somente os campos compatíveis com o formato aceito pelo aplicativo.
5. O enxame atualiza sua forma, e a interface apresenta uma mensagem de estado sobre a transformação.

O ChatGPT não renderiza diretamente os microcubos e não controla a cena por uma imagem pronta: ele orienta a transformação; o aplicativo realiza a renderização 3D.

### Exemplos de pedidos

Digite um destes exemplos no campo de comando:

- `Transforme-se em uma nave espacial futurista.`
- `Crie uma nave com casco cúbico, cockpit central, asas laterais e motores de propulsão.`
- `Transforme o enxame em uma casa futurista com paredes, janelas e telhado geométrico.`
- `Forme uma espiral tridimensional compacta usando microcubos.`
- `Crie uma esfera de microcubos e mantenha uma composição simétrica.`
- `Aumente a população de microcubos para melhorar a definição visual, se o limite do aplicativo permitir.`
- `Use uma aparência tecnológica em tons de azul-ciano e azul elétrico.`
- `Reconstrua o rosto da referência usando somente cubos.`
- `Descreva uma estrutura que possa servir de conceito visual para uma peça de impressão 3D.`

Os exemplos são pedidos em linguagem natural, não garantias de que todos os detalhes serão executados. O resultado depende dos campos reconhecidos pela aplicação e dos recursos implementados.

## Interface principal

### Campo de comando e estado da transformação

Escreva uma descrição concreta. Nomes de componentes, forma geral, distribuição e estilo ajudam a comunicar a intenção. Por exemplo:

> Transforme-se em uma nave espacial futurista, com casco cúbico, cockpit central, asas laterais e propulsores, usando tons de ciano e azul elétrico.

Depois, pressione **Enviar ao ChatGPT** e aguarde a resposta. Evite enviar o mesmo pedido repetidamente enquanto a primeira solicitação ainda estiver sendo processada.

### População e energia

- **População de microcubos:** mais cubos podem dar mais detalhe, mas também aumentam o custo de renderização.
- **Energia coletiva:** modifica o parâmetro de energia do enxame conforme a implementação atual.

A quantidade ideal depende da complexidade da forma e do desempenho do computador. Aumentar a população não garante, por si só, uma reprodução perfeita.

### Identidade química

O projeto associa slots do enxame aos 118 elementos químicos por uma regra determinística:

`Z = (slot mod 118) + 1`

Essa associação representa a identidade química usada pelo projeto; ela não significa que a cena seja uma simulação física, molecular ou quântica validada.

## Botões e módulos

### Demonstração química

Use **Abrir demonstração química** para acessar a visualização dedicada à identidade química dos microcubos e à tabela de 118 elementos, conforme disponível na versão instalada.

### Agente de automação local

O botão **Abrir agente de automação local** abre o painel de automação. Ações como navegação, cliques, preenchimento de campos, acesso a arquivos e execução de operações podem exigir permissões e aprovação por tarefa.

- Comece com as permissões desativadas e habilite somente o necessário.
- Autorize apenas diretórios e origens que pretende utilizar.
- Interrompa as tarefas quando necessário usando o controle de interrupção disponível.
- Não exponha o servidor local à rede pública.

A automação não deve ser interpretada como autorização irrestrita para executar qualquer comando ou modificar qualquer arquivo.

### Atomic Forge 3D

O botão **Abrir Atomic Forge 3D** abre o módulo de modelagem paramétrica. Na implementação documentada, o módulo oferece uma peça demonstrativa editável e recursos de visualização/análise, como dimensões, caixa delimitadora, área, volume, triângulos e massa teórica quando há densidade disponível. Também pode permitir exportar STL, JSON e relatório técnico.

**Limitações:** não presuma que o módulo seja um CAD genérico ou um sistema completo de fabricação. Análises visuais não equivalem a simulação física; massa teórica depende das hipóteses adotadas; e arquivos STL devem ter as unidades conferidas antes da utilização. A geração de G-code, o fatiamento e a impressão física não são garantidos.

## Reconstrução de rosto por cubos

O modo de rosto pode reconstruir uma referência frontal como uma distribuição de cubos com cores e posições amostradas. Um pedido possível é:

> Reconstrua o rosto da referência usando somente cubos, preservando as cores e a distribuição visual.

A reconstrução é uma aproximação voxelizada frontal. Ela não garante igualdade pixel a pixel nem representa automaticamente uma cabeça volumétrica completa vista de todos os ângulos. Animações de olhos ou boca, quando presentes, são efeitos visuais e não significam análise de áudio ou síntese de voz.

## Instalação e execução local

Requisitos gerais: Node.js 20 ou superior, npm e navegador moderno com suporte a WebGL.

Na pasta do projeto:

```bash
npm ci
npm start
```

Abra:

`http://127.0.0.1:8765/`

Se a versão oferecer a rota de demonstração, também pode ser usada:

`http://127.0.0.1:8765/?demo=1`

Não abra o HTML diretamente pelo sistema de arquivos. Execute o servidor local e utilize o endereço informado pela aplicação.

## Configurar a ponte local com ChatGPT

A ponte depende da configuração e da versão instalada. No fluxo CDP documentado, é necessário abrir um Chrome dedicado com depuração remota e perfil separado:

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.config/gridsoul-chrome"
```

Na janela dedicada, autentique-se manualmente em `https://chatgpt.com/` e mantenha-a aberta. Em outro terminal, execute `npm start` na pasta do projeto e abra a interface do GRID SOUL.

A porta CDP concede controle sobre as abas do perfil correspondente. Por isso:

- use um perfil dedicado, não seu perfil pessoal habitual;
- não compartilhe nem exponha a porta `9222` pela rede;
- não distribua cookies, perfis do navegador ou arquivos `.env`;
- não envie o mesmo pedido várias vezes enquanto a primeira solicitação estiver em andamento.

Se a ponte não responder, confirme que o Chrome dedicado está aberto, autenticado e iniciado com a porta correta. A renderização local pode funcionar mesmo quando a ponte com o ChatGPT não está disponível.

## Privacidade e segurança

O aplicativo é executado localmente, mas o texto enviado ao ChatGPT é processado pelo serviço conforme a conta e as configurações aplicáveis. Não inclua senhas, tokens, dados pessoais sensíveis ou informações confidenciais nos pedidos.

A automação local deve operar com permissões mínimas e aprovações explícitas. O acesso CDP permite controlar o navegador do perfil dedicado; mantê-lo privado é essencial. Não publique arquivos `.env`, cookies, perfis de navegador ou dados locais de memória.

## Testes

Para executar os testes definidos pelo projeto:

```bash
npm test
npm run check
```

Os resultados dependem da versão exata do código e do ambiente instalado. Uma suíte automatizada não comprova, por si só, que uma sessão real do ChatGPT, a renderização em todos os navegadores ou uma impressão física funcionará sem problemas.

## Limitações gerais

- A resposta do ChatGPT é uma proposta interpretada pelo aplicativo, não uma garantia de que todos os detalhes serão executados.
- Os efeitos visuais dependem dos recursos realmente implementados; parâmetros desconhecidos podem ser ignorados ou validados.
- A cena de microcubos é uma representação visual, não uma simulação científica completa.
- A identidade dos 118 elementos não comprova composição química real dos materiais.
- Modelos destinados à impressão 3D precisam de validação de geometria, escala, resistência, tolerâncias e compatibilidade com o processo de fabricação antes de qualquer uso físico.

---

**Resumo da mudança:** o README agora descreve o GRID SOUL como uma interface de criação 3D por comandos em linguagem natural, documenta o fluxo de pedidos e respostas com o ChatGPT e explica os botões de demonstração química, automação local e Atomic Forge 3D, além dos controles de população, energia e identidade química.


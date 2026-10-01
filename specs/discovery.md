# Discovery — Weather App

## Resumo Executivo

- O Weather App permitirá consultar as condições atuais e a previsão diária de
  hoje mais quatro dias para diferentes cidades.
- A primeira versão será responsiva, em pt-BR, com Celsius padrão e opção de
  Fahrenheit; não terá contas, dados persistidos no servidor nem alertas severos.
- Os dados virão da Open-Meteo, sem exigir chave de API do usuário; as personas
  identificadas ainda são hipóteses a validar.
- A experiência deverá ser acessível, funcionar em dispositivos móveis e
  desktop e comunicar claramente carregamentos e falhas.
- Antes de aprovar a especificação, faltam validar público e sucesso, conteúdo da
  previsão, busca e fusos horários, privacidade e metas operacionais.

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para permitir que
usuários consultem as condições meteorológicas de diferentes cidades de forma
simples, incluindo o clima atual e uma previsão para os próximos cinco dias.

O produto deve atender tanto a consultas rápidas no desktop quanto ao uso em
dispositivos móveis. A experiência também precisa permitir a escolha da unidade
de temperatura mais adequada ao usuário: Celsius ou Fahrenheit.

As decisões registradas nesta análise definem Open-Meteo como fonte, "5 dias"
como hoje mais os quatro dias seguintes, Celsius como unidade padrão, pt-BR
como idioma e ausência de autenticação e persistência no servidor. Permanecem
em aberto detalhes como comportamento e cobertura da busca, conteúdo da previsão,
fuso horário, localização automática, cache e persistência local.

## Personas (hipóteses)

As personas abaixo são hipóteses iniciais para orientar o discovery e devem ser
validadas com usuários reais.

### Camila — consulta rápida antes de sair

- **Objetivo principal:** Saber como está o tempo agora e o que esperar nos
  próximos dias para decidir o que vestir ou levar.
- **Contexto de uso:** Principalmente em dispositivos móveis e em consultas
  curtas; precisa identificar a cidade correta sem esforço.
- **Métrica de sucesso:** Em um teste, encontra a condição atual e a previsão da
  cidade desejada em até 30 segundos, sem selecionar uma localização errada.

### Rafael — planejamento de viagem

- **Objetivo principal:** Consultar a previsão de uma cidade para planejar
  atividades e bagagem com alguns dias de antecedência.
- **Contexto de uso:** Principalmente em desktop e em sessões mais longas;
  consulta diferentes cidades uma por vez.
- **Métrica de sucesso:** Identifica as condições e datas dos cinco dias e
  conclui a consulta sem recorrer a outra fonte para interpretar os dados.

### Luiza — usuária de Fahrenheit

- **Objetivo principal:** Consultar temperaturas na unidade com que está
  acostumada, sem precisar fazer conversões mentais.
- **Contexto de uso:** Em dispositivos móveis ou desktop; alterna entre Celsius
  e Fahrenheit durante a consulta.
- **Métrica de sucesso:** Todas as temperaturas visíveis correspondem à unidade
  escolhida, e ela interpreta a previsão sem conversões externas.

## Requisitos Funcionais

1. O usuário deve poder informar o nome de uma cidade para realizar uma busca.
2. O sistema deve apresentar resultados de localização compatíveis com a busca
   quando houver mais de uma cidade possível.
3. O usuário deve poder selecionar uma cidade encontrada.
4. O sistema deve exibir o clima atual da cidade selecionada.
5. O clima atual deve incluir, no mínimo, a temperatura e uma descrição ou
   indicação das condições meteorológicas.
6. O sistema deve exibir uma previsão do tempo para cinco dias.
7. O usuário deve poder alternar a unidade de temperatura entre Celsius e
   Fahrenheit.
8. A troca de unidade deve atualizar os valores de temperatura apresentados na
   interface.
9. O sistema deve informar quando uma cidade não for encontrada.
10. O sistema deve informar claramente quando ocorrer uma falha ao buscar dados
  meteorológicos e permitir que o usuário tente novamente.
11. O sistema deve apresentar um estado inicial ou vazio antes de uma cidade
    ser selecionada.
12. O sistema deve permitir realizar uma nova busca após uma consulta anterior.
13. O sistema deve apresentar um estado de carregamento enquanto aguarda
  respostas de geocoding ou de dados meteorológicos.

## Requisitos Não-Funcionais

### Responsividade e usabilidade

- A interface deve funcionar em dispositivos móveis e em telas maiores.
- A interface deve funcionar em larguras de 320 px a 1920 px sem rolagem
  horizontal.
- Conteúdo, controles e resultados devem permanecer legíveis e utilizáveis em
  toda a faixa de larguras suportada.
- A busca e a alternância de unidade devem ser compreensíveis sem treinamento
  prévio.

### Acessibilidade

- Campos, botões, mensagens e resultados devem possuir nomes e semântica
  acessíveis.
- A aplicação deve ser utilizável por teclado.
- Estados de carregamento, erro e ausência de resultados devem ser perceptíveis
  visualmente e comunicados a tecnologias assistivas.
- A interface deve atender ao WCAG 2.2 nível AA, incluindo os requisitos
  aplicáveis de contraste.

### Desempenho e disponibilidade

- A aplicação deve evitar requisições desnecessárias ao alternar entre Celsius e
  Fahrenheit.
- Após o envio de uma busca, a interface deve indicar carregamento em até
  200 ms.
- Quando o provedor responder em até 2,5 s, os resultados devem ser exibidos em
  até 3 s no percentil 95.
- Requisições externas devem expirar após, no máximo, 10 s.
- A aplicação deve manter disponibilidade mensal mínima de 99,5%, sem contabilizar
  períodos de indisponibilidade do provedor externo.

### Compatibilidade e localização

- A aplicação deve funcionar nas duas versões estáveis mais recentes de Chrome,
  Edge, Firefox e Safari.
- Textos e mensagens devem ser apresentados em pt-BR; datas e horários devem
  seguir uma convenção clara e consistente.
- Datas e horários devem seguir uma convenção clara e consistente.

## Riscos

As probabilidades são estimativas iniciais para o MVP e devem ser revistas quando
o público, as métricas e as condições operacionais forem definidos.

| Tipo | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| Produto | O app não atender à necessidade do público prioritário, ainda não definido. | Alta | Alto | Definir público e tarefas principais; validar o fluxo de busca e consulta com usuários antes de ampliar o escopo. |
| Produto | Usuários não encontrarem dados suficientes ou úteis na previsão diária. | Média | Alto | Definir campos obrigatórios para clima atual e previsão, incluindo critérios de aceite por dia. |
| Produto | Localização errada ser selecionada quando há cidades com nomes iguais. | Média | Alto | Exibir cidade, região e país; definir cobertura geográfica e testar consultas ambíguas. |
| Produto | Usuários interpretarem a previsão básica como alerta ou orientação para situações de risco. | Média | Alto | Informar na interface que o app não fornece alertas severos e orientar a consulta a fontes oficiais para avisos. |
| Técnico | Indisponibilidade ou lentidão da Open-Meteo impedir a consulta. | Média | Alto | Definir timeout e tratamento de erro, permitir nova tentativa e avaliar cache identificado como desatualizado. |
| Técnico | Limites de uso ou condições do provedor afetarem custo, disponibilidade ou forma de exibição dos dados. | Média | Alto | Confirmar condições de uso, limites e atribuição; monitorar consumo e definir uma estratégia de contingência. |
| Técnico | Respostas parciais, inválidas ou alteradas causarem dados incorretos ou falhas na interface. | Média | Alto | Validar o formato das respostas, tratar campos ausentes sem inventar valores e testar cenários de erro. |
| Técnico | Buscas rápidas ou concorrentes mostrarem resultados de uma cidade anterior. | Média | Médio | Cancelar ou descartar respostas antigas e testar buscas consecutivas, erros e novas tentativas. |
| Técnico | Metas de performance não serem atingidas por variação de rede ou tempo de resposta externo. | Média | Alto | Definir ambiente de medição, acompanhar percentis e separar latência do app da latência do provedor. |
| Técnico | Permissão de localização ou armazenamento local expor dados que o usuário não espera compartilhar. | Baixa | Alto | Solicitar localização apenas com consentimento, minimizar dados armazenados e explicar o uso e a retenção. |
| Técnico | Barreiras de acessibilidade ou problemas em telas pequenas impedirem o uso do app. | Média | Alto | Validar WCAG 2.2 AA com teclado e tecnologias assistivas; testar a faixa de viewport definida em dispositivos reais. |
| Técnico | A meta de disponibilidade não refletir a disponibilidade percebida, por excluir falhas do provedor. | Média | Médio | Medir separadamente frontend, rede e provedor; definir indicadores de degradação e monitoramento sintético. |
| Produto / Técnico | Expectativa de uso offline não corresponder ao comportamento real do app. | Média | Médio | Decidir se haverá cache offline; se houver, mostrar a data dos dados e distingui-los claramente de dados atuais. |

## Perguntas em Aberto

As decisões registradas já definem Open-Meteo como fonte, previsão diária de hoje
mais quatro dias, Celsius como unidade padrão, pt-BR como idioma e ausência de
autenticação ou persistência no servidor. As perguntas abaixo tratam das lacunas
restantes; cada impacto descreve o risco de avançar sem resposta.

### Produto e público

1. **Público e necessidade:** Quem é o público prioritário, em quais regiões
  estará e para quais decisões ou tarefas usará o app?
  **Impacto:** Sem isso, não há base para priorizar conteúdo, cobertura
  geográfica, formatos ou fluxos da interface.
2. **Critério de sucesso:** Quais métricas indicarão que o produto atende à
  necessidade, como buscas concluídas, recorrência ou tempo para encontrar uma
  previsão?
  **Impacto:** O time pode entregar funcionalidades sem conseguir avaliar se
  resolveram o problema do usuário.
3. **Aviso sobre alertas:** Como e onde informar que o app não fornece alertas
  severos e que avisos oficiais devem ser consultados em fontes apropriadas?
  **Impacto:** Sem uma mensagem clara, usuários podem interpretar a previsão
  básica como suficiente para situações de risco.

### Busca e experiência

4. **Cobertura geográfica:** A busca deve cobrir cidades globalmente ou apenas
  países/regiões específicos? Como distinguir locais com o mesmo nome?
  **Impacto:** A busca pode omitir cidades relevantes ou levar à seleção de um
  local incorreto.
5. **Regras da busca:** Como tratar acentos, erros de digitação, nomes parciais,
  consultas vazias e variações de idioma? A busca ocorre ao digitar ou após
  envio explícito?
  **Impacto:** Resultados e mensagens ficam inconsistentes, e a implementação
  pode exigir retrabalho.
6. **Localização automática:** O app deve solicitar a localização do dispositivo?
  O que acontece quando a permissão é negada ou indisponível?
  **Impacto:** A decisão altera o primeiro uso, as permissões solicitadas, a
  privacidade e o fluxo alternativo de busca.
7. **Fluxo inicial e navegação:** O que deve aparecer antes da primeira busca e
  como o usuário retorna aos resultados ou troca a cidade selecionada?
  **Impacto:** A consulta rápida pode ficar confusa ou exigir passos
  desnecessários.

### Dados meteorológicos

8. **Clima atual:** Quais informações são essenciais além de temperatura e
  descrição, como sensação térmica, umidade, vento ou mínima/máxima?
  **Impacto:** A resposta afeta o contrato de dados, o layout e a percepção de
  completude da consulta.
9. **Previsão diária:** Quais valores devem aparecer em cada dia, como mínima,
  máxima ou probabilidade de chuva?
  **Impacto:** “Cinco dias” define o período, mas não o conteúdo necessário para
  atender ao usuário.
10. **Fuso horário:** As datas devem seguir o horário local da cidade consultada?
   Qual regra define a mudança de dia na previsão?
   **Impacto:** Dias e datas podem ser exibidos incorretamente para cidades em
   fusos diferentes do usuário.
11. **Atualização e validade:** Com que frequência os dados devem ser
   atualizados? A interface deve mostrar quando foram obtidos e identificar
   dados antigos em cache?
   **Impacto:** O usuário pode confiar em dados desatualizados, ou o app pode
   gerar requisições desnecessárias.
12. **Unidades adicionais e arredondamento:** Se outras medidas forem exibidas,
   quais unidades serão usadas para vento e precipitação? Como arredondar
   temperaturas?
   **Impacto:** A interface pode misturar convenções ou apresentar valores
   confusos; a decisão de Celsius padrão não resolve essas regras.
13. **Dados parciais ou ausentes:** Deve-se ocultar um campo, indicar que está
   indisponível ou tratar a resposta inteira como erro?
   **Impacto:** Sem uma regra consistente, a interface pode parecer quebrada ou
   apresentar dados incompletos como se fossem válidos.

### Integrações e resiliência

14. **Condições do provedor:** Quais limites de uso, requisitos de atribuição,
   condições de uso e formatos da Open-Meteo precisam ser considerados? É
   necessário um provedor alternativo?
   **Impacto:** A integração pode não ser sustentável ou compatível com as
   condições de uso, e uma falha pode interromper todo o serviço.
15. **Falhas e novas tentativas:** Quantas tentativas serão permitidas? Deve
   haver espera progressiva, cancelamento de buscas antigas ou descarte de
   respostas que chegam fora de ordem?
   **Impacto:** Podem ocorrer chamadas duplicadas, resultados de uma cidade
   anterior ou recuperação inconsistente após falhas.
16. **Uso offline e cache:** O app deve funcionar sem rede ou exibir a última
   previsão em cache, identificando-a como desatualizada?
   **Impacto:** A decisão altera o armazenamento local, a privacidade e o
   comportamento durante falhas de rede.
17. **Persistência local:** Sem contas ou persistência no servidor, o app deve
   lembrar a unidade escolhida, a última cidade ou um histórico neste
   dispositivo? Por quanto tempo?
   **Impacto:** Define armazenamento local e comportamento em dispositivos
   compartilhados ou após limpeza dos dados do navegador.

### Privacidade e critérios de aceite

18. **Telemetria e retenção:** Serão coletadas métricas de uso, buscas,
   localização ou erros? O que será registrado e por quanto tempo?
   **Impacto:** Consultas e localização podem ser dados sensíveis; a decisão
   afeta consentimento, logs e política de privacidade.
19. **Metas de desempenho:** Os limites registrados de feedback em 200 ms e
   resultados em até 3 s no percentil 95 foram aprovados? Em quais dispositivos
   e condições de rede serão medidos?
   **Impacto:** Sem condições de medição, a meta não é verificável e não se
   distingue lentidão do app de lentidão do provedor.
20. **Disponibilidade:** Como será medida a meta de 99,5% quando a disponibilidade
   do provedor externo está excluída? Como contar falhas parciais e falhas de
   rede do usuário?
   **Impacto:** A métrica pode não representar a disponibilidade percebida nem
   indicar quem é responsável por cada falha.
21. **Dispositivos e navegadores:** A faixa de 320–1920 px e as duas versões
   estáveis mais recentes dos navegadores listados cobrem o público esperado?
   Há dispositivos ou versões prioritários?
   **Impacto:** A matriz pode gerar esforço de teste desnecessário ou excluir
   dispositivos importantes para o público.
22. **Validação de acessibilidade:** Quais tecnologias assistivas e fluxos
   críticos serão usados para verificar o atendimento ao WCAG 2.2 nível AA?
   **Impacto:** Declarar conformidade sem definir validação pode deixar
   barreiras de navegação ou leitura sem detecção.

## Decisões

### Fonte de dados: Open-Meteo

Usaremos a Open-Meteo para geocoding e previsão do tempo, sem exigir uma API
key do usuário.

**Justificativa:** a fonte atende ao escopo do treinamento e permite integrar
dados meteorológicos sem introduzir cadastro, cobrança ou gerenciamento de
segredos nesta primeira versão.

**Perguntas resolvidas:** define o provedor de dados, elimina a necessidade de
autenticação para uso da API e estabelece a base para o contrato de dados e a
estratégia de tratamento de falhas.

### Escopo da previsão: hoje + quatro dias

Os cinco dias exibidos serão o dia atual e os quatro dias seguintes, em visão
diária.

**Justificativa:** transforma a expressão ambígua "previsão de 5 dias" em uma
regra objetiva e mantém a primeira versão simples de consultar e validar.

**Perguntas resolvidas:** define se hoje está incluído e estabelece que o
produto exibirá dados diários, não uma previsão horária.

### Unidade padrão: Celsius

Temperaturas serão apresentadas inicialmente em Celsius, com opção de alternar
para Fahrenheit.

**Justificativa:** Celsius é a unidade mais adequada ao público pt-BR e a
alternância preserva o suporte a usuários acostumados a Fahrenheit.

**Perguntas resolvidas:** define a unidade inicial, o comportamento esperado na
primeira visita e o requisito de conversão na interface.

### Autenticação e persistência de servidor: fora do escopo

A primeira versão não terá autenticação nem armazenamento de dados do usuário
em servidor.

**Justificativa:** mantém o MVP focado na consulta meteorológica e evita
complexidade de contas, sessões, banco de dados e requisitos adicionais de
privacidade.

**Perguntas resolvidas:** define que não haverá contas de usuário nem histórico
persistido no servidor nesta fase. Preferências locais, se necessárias, devem
ser tratadas separadamente no plano técnico.

### Idioma da interface: pt-BR

Todos os textos, mensagens, rótulos e formatos de apresentação da interface
serão direcionados ao português do Brasil.

**Justificativa:** alinha a experiência ao público inicial e evita que a
internacionalização bloqueie a primeira entrega.

**Perguntas resolvidas:** define o idioma inicial e orienta a formatação de
datas, mensagens e unidades para o produto.

### Alertas meteorológicos severos: fora do MVP

A primeira versão não exibirá alertas meteorológicos severos.

**Justificativa:** mantém o escopo inicial focado em consultas de condições
atuais e previsão diária, sem sugerir cobertura de avisos de emergência.

**Perguntas resolvidas:** define que alertas severos não fazem parte do MVP. A
forma e o local de comunicar essa limitação permanecem em aberto.

## Suposições

- O produto será uma aplicação web responsiva, sem necessidade de aplicativo
  nativo nesta fase.
- A busca será feita por nome de cidade e poderá retornar mais de uma opção para
  desambiguação.
- O clima atual incluirá pelo menos temperatura e condição meteorológica; o
  conteúdo mínimo da previsão diária permanece em aberto.
- A ausência de dados ou uma falha de rede será tratada com mensagens claras,
  sem exibir valores inventados.
- O escopo inicial não inclui mapas, notificações, histórico de cidades ou
  previsão hiperlocal.
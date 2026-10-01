# Backlog de Tarefas — Weather App

Backlog derivado de `plans/weather-app-plan.md` e rastreável à especificação
em `specs/weather-app-spec.md`. As tarefas foram divididas para manter uma
responsabilidade principal, normalmente limitada a um ou dois arquivos
relevantes, e são ordenadas por dependência. Os IDs foram preservados para
manter a rastreabilidade; a ordem de implementação é definida pelas entregas
e pelo campo **Dependências**.

## Priorização e tamanho

**Prioridade:** P0 é necessário para o fluxo MVP funcionar; P1 é importante
para qualidade, acessibilidade e robustez antes do release; P2 é necessário
para validação de desempenho e publicação, mas não bloqueia a primeira versão
visível. **Tamanho:** P (pequeno), M (médio) e G (grande), considerando risco,
integração e esforço relativo, não quantidade de linhas.

| Tarefa | Prioridade | Tamanho | Justificativa curta |
| --- | --- | --- | --- |
| T-01 | P0 | P | Contratos necessários para todo o domínio. |
| T-02 | P0 | P | Função matemática isolada. |
| T-03 | P0 | P | Formatação isolada dependente da conversão. |
| T-04 | P0 | P | Catálogo puro de códigos WMO. |
| T-05 | P0 | P | Formatadores puros de data e número. |
| T-06 | P0 | P | Bootstrap e idioma do documento. |
| T-07 | P0 | M | Infraestrutura compartilhada de rede, timeout e abortamento. |
| T-08 | P0 | M | Validação e normalização de payload externo. |
| T-09 | P0 | M | Primeiro fluxo externo completo de busca. |
| T-10 | P0 | M | Normalização de resposta meteorológica parcial. |
| T-11 | P0 | M | Segundo fluxo externo completo de forecast. |
| T-12 | P0 | P | Testes unitários determinísticos de temperatura. |
| T-13 | P0 | M | Testes de service com mock de fetch e falhas. |
| T-14 | P0 | M | Testes de forecast com contrato e payloads parciais. |
| T-15 | P0 | M | Máquina de estados da busca. |
| T-16 | P0 | M | Máquina de estados meteorológica e retry. |
| T-17 | P0 | M | Concorrência e invalidação de respostas. |
| T-18 | P0 | M | Testes dos estados básicos do hook. |
| T-19 | P0 | M | Testes de concorrência e chamadas da unidade. |
| T-20 | P0 | P | Componente de entrada e envio. |
| T-21 | P0 | M | Interação de resultados e teclado. |
| T-22 | P0 | M | Estados visuais e semântica de feedback. |
| T-23 | P0 | M | Painel de condições atuais. |
| T-24 | P0 | M | Lista de cinco dias. |
| T-25 | P0 | P | Aviso textual isolado. |
| T-26 | P0 | P | Controle de unidade. |
| T-27 | P0 | G | Composição e integração de todos os fluxos da tela. |
| T-28 | P0 | M | Testes de busca, seleção e teclado. |
| T-29 | P0 | M | Testes de loading, erro, vazio e segurança de texto. |
| T-30 | P0 | M | Testes dos componentes meteorológicos. |
| T-31 | P0 | M | Teste integrado da aplicação. |
| T-32 | P0 | G | E2E do fluxo principal em desktop e mobile. |
| T-33 | P1 | M | E2E de falhas, timeout e recuperação. |
| T-34 | P1 | P | E2E de idioma e aviso de segurança. |
| T-35 | P1 | M | Matriz de responsividade. |
| T-36 | P1 | M | Acessibilidade, teclado, contraste e browsers. |
| T-37 | P1 | M | Gate automatizado completo do repositório. |
| T-38 | P2 | M | Medição de p95 e separação de latências. |
| T-39 | P2 | P | Registro de termos, limites e atribuição. |
| T-40 | P0 | P | Testes puros de WMO e localização. |

## Sequência de fatias verticais

Cada fatia deve ser executada até deixar o comportamento indicado visível e
testável. T-27 pode ser implementada incrementalmente durante as fatias de UI:
primeiro compondo a busca e depois conectando o clima, sem alterar seu critério
final de aceite.

1. **Fatia 1 — Busca de cidade:** T-01, T-04, T-05, T-06, T-07, T-08, T-09, T-15, T-20, T-21, T-22 e a primeira parte de T-27. Resultado visível: a pessoa digita uma cidade, vê até cinco opções, recebe vazio/erro e pode selecionar uma opção.
2. **Fatia 2 — Condições atuais:** T-02, T-03, T-10, T-11, T-16, T-17, T-23, T-26 e a segunda parte de T-27. Resultado visível: a cidade selecionada mostra condições atuais, loading/erro/retry e troca Celsius/Fahrenheit.
3. **Fatia 3 — Previsão completa:** T-24 e T-25. Resultado visível: cinco dias locais aparecem com campos ausentes identificados e o aviso de segurança fica junto à previsão.
4. **Fatia 4 — Confiança do núcleo:** T-12, T-13, T-14, T-18, T-19, T-28, T-29, T-30, T-31 e T-40. Resultado verificável: unitários, services, hook e componentes cobrem o fluxo principal e suas transições sem depender da API real.
5. **Fatia 5 — Validação de produto:** T-32, T-33, T-34, T-35 e T-36. Resultado verificável: fluxo E2E principal em desktop/mobile, recuperação de falhas, idioma, responsividade e acessibilidade.
6. **Fatia 6 — Release:** T-37, T-38 e T-39. Resultado verificável: gates passam, desempenho é medido e os requisitos do provedor têm status documentado.

## Entrega 1 — Fundações do domínio

### T-01 — Definir contratos compartilhados do clima
- **Título:** Criar os tipos internos de cidade, clima, previsão, unidade e estados.
- **Descrição:** Implementar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `SearchState` e `WeatherState` conforme os contratos do plano.
- **Critérios de aceite:** `pnpm build` compila em TypeScript strict; `City` contém ID, nome e coordenadas; `WeatherData` contém cidade, timezone, clima atual e `ForecastDay[]`; `SearchState` e `WeatherState` são discriminados; o arquivo não importa React, `fetch` ou módulos de UI.
- **Rastreabilidade:** FR-03, FR-04, FR-05, FR-09, FR-14 / AC-03, AC-04, AC-05, AC-09, AC-14.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data

### T-02 — Implementar conversão de temperatura
- **Título:** Criar conversão pura de Celsius para Fahrenheit.
- **Descrição:** Implementar a conversão sem arredondar o valor Celsius de origem.
- **Critérios de aceite:** `0 °C` resulta em `32 °F`, `100 °C` em `212 °F` e `-40 °C` em `-40 °F`; a função não faz I/O nem depende de React.
- **Rastreabilidade:** FR-06 / AC-06, NFR-01, NFR-09.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data

### T-03 — Implementar formatação de temperatura
- **Título:** Formatar temperaturas e valores ausentes.
- **Descrição:** Criar a função de apresentação com uma casa decimal e unidade Celsius/Fahrenheit.
- **Critérios de aceite:** Valores são exibidos com uma casa decimal e convenção `pt-BR`; valores ausentes resultam em `Indisponível`; a função não altera os dados normalizados.
- **Rastreabilidade:** FR-06, FR-14 / AC-06, AC-14, NFR-09, NFR-10.
- **Dependências:** T-01, T-02
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data

### T-04 — Mapear códigos WMO para pt-BR
- **Título:** Criar o catálogo de condições meteorológicas.
- **Descrição:** Mapear os códigos WMO usados pela Open-Meteo para descrições em pt-BR, com fallback para códigos desconhecidos.
- **Critérios de aceite:** Códigos conhecidos têm descrições em pt-BR; código desconhecido ou ausente resulta em `Indisponível`; a função é pura.
- **Rastreabilidade:** FR-04, FR-05, FR-14 / AC-04, AC-05, AC-14, NFR-01, NFR-10.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Tipo:** Data

### T-05 — Implementar formatação localizada
- **Título:** Formatar datas, números e unidades no fuso retornado.
- **Descrição:** Criar funções puras para datas `YYYY-MM-DD`, números `pt-BR` e valores ausentes, respeitando timezone IANA.
- **Critérios de aceite:** Datas usam o fuso fornecido sem alterar a ordem; números usam vírgula decimal; horários, se exibidos, usam 24 horas; entradas inválidas não geram valores inventados.
- **Rastreabilidade:** FR-04, FR-05, FR-14 / AC-04, AC-05, AC-14, NFR-10.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/formatting.ts`
- **Tipo:** Data

### T-06 — Configurar bootstrap e idioma do documento
- **Título:** Garantir montagem da SPA em português do Brasil.
- **Descrição:** Ajustar o documento e o ponto de montagem para declarar o idioma e iniciar o React pelo fluxo existente do Vite.
- **Critérios de aceite:** A aplicação monta sem erro; `index.html` declara `lang="pt-BR"`; nenhum request externo ocorre durante a montagem inicial.
- **Rastreabilidade:** FR-09 / AC-09, NFR-03, NFR-10, NFR-11.
- **Dependências:** T-01
- **Arquivos prováveis:** `index.html`, `src/main.tsx`
- **Tipo:** Infra

## Entrega 2 — Acesso e normalização de dados

### T-07 — Criar utilitário de requests Open-Meteo
- **Título:** Centralizar timeout, abortamento e erros HTTP.
- **Descrição:** Implementar a base de request com sinal externo, timeout de 10 segundos, status HTTP e parsing JSON controlado.
- **Critérios de aceite:** Toda chamada termina em no máximo 10 segundos; o sinal externo pode abortá-la; abortamento é distinguível de erro comum; HTTP, rede, timeout e JSON inválido geram erro recuperável.
- **Rastreabilidade:** FR-08, FR-13, FR-15 / AC-08, AC-10, AC-13, NFR-07.
- **Dependências:** —
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-08 — Implementar normalização de cidades
- **Título:** Mapear respostas de geocoding para `City[]`.
- **Descrição:** Criar a função pura que valida campos obrigatórios, mapeia região/país e remove IDs duplicados preservando a ordem.
- **Critérios de aceite:** IDs, nome e coordenadas obrigatórios são validados; campos opcionais são preservados; IDs repetidos mantêm a primeira ocorrência; payload inválido gera erro.
- **Rastreabilidade:** FR-02, FR-03 / AC-02, AC-03, NFR-01.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-09 — Implementar busca de cidades
- **Título:** Consultar o endpoint de geocoding.
- **Descrição:** Implementar `searchCities(query, signal?)` usando a normalização de cidades e os parâmetros `name`, `count=5`, `language=pt` e `format=json`.
- **Critérios de aceite:** A função retorna no máximo cinco cidades na ordem do provedor; lista vazia retorna `[]`; não seleciona cidade automaticamente; erros HTTP, rede, timeout e estrutura inválida são propagados sem logs de consulta.
- **Rastreabilidade:** FR-01, FR-02, FR-07, FR-13 / AC-01, AC-02, AC-07, AC-13, NFR-01, NFR-07, NFR-11.
- **Dependências:** T-07, T-08
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-10 — Implementar normalização do forecast
- **Título:** Mapear resposta meteorológica para `WeatherData`.
- **Descrição:** Criar a função pura que associa current/daily à cidade selecionada e mantém os valores Celsius sem arredondamento.
- **Critérios de aceite:** Cidade, timezone e cinco datas são preservados; campos ausentes ou nulos viram `undefined`; cada métrica é associada ao índice correto; datas ausentes e arrays incompatíveis geram erro.
- **Rastreabilidade:** FR-04, FR-05, FR-14 / AC-04, AC-05, AC-14, NFR-01, NFR-10.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-11 — Implementar busca de forecast
- **Título:** Consultar cinco dias com os parâmetros fixos da API.
- **Descrição:** Implementar `getWeather(city, signal?)` com current/daily, `timezone=auto`, `forecast_days=5`, Celsius, km/h e mm.
- **Critérios de aceite:** A URL contém todos os parâmetros do plano; uma resposta válida retorna cinco dias; respostas HTTP, rede, timeout e JSON inválido geram erro; a função não depende de React.
- **Rastreabilidade:** FR-04, FR-05, FR-08, FR-14 / AC-04, AC-05, AC-08, AC-14, NFR-01, NFR-07.
- **Dependências:** T-07, T-10
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

## Entrega 3 — Orquestração e estados

### T-15 — Implementar estado de busca no hook
- **Título:** Orquestrar consulta, loading, vazio e erro de geocoding.
- **Descrição:** Criar a parte de `useWeather` responsável pela consulta preservada, validação de entrada, chamada de `searchCities` e retry de busca.
- **Critérios de aceite:** Com `"   "`, nenhum serviço é chamado e o estado permanece disponível para nova entrada; com `"  São José  "`, `searchCities` recebe `"São José"`; estados observáveis são `idle → loading → success|empty|error`; erro mantém a consulta; retry faz uma nova chamada com o mesmo termo.
- **Rastreabilidade:** FR-01, FR-07, FR-11, FR-12, FR-13 / AC-01, AC-07, AC-11, AC-12, AC-13.
- **Dependências:** T-01, T-09
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-16 — Implementar estado de previsão no hook
- **Título:** Orquestrar seleção, loading, sucesso, erro e retry de forecast.
- **Descrição:** Adicionar ao hook a cidade selecionada, limpeza de dados antigos, chamada de `getWeather` e unidade inicial Celsius.
- **Critérios de aceite:** Antes da seleção, `weatherState.status` é `idle`; ao selecionar B, os dados de A deixam de ser expostos antes do request; sucesso armazena B; erro mantém B e oferece retry; após sucesso, dez alternâncias de unidade não chamam `searchCities` nem `getWeather`.
- **Rastreabilidade:** FR-03, FR-04, FR-06, FR-08, FR-09, FR-10 / AC-03, AC-04, AC-06, AC-08, AC-09, AC-10, NFR-09.
- **Dependências:** T-01, T-03, T-11, T-15
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-17 — Proteger o hook contra concorrência obsoleta
- **Título:** Invalidar requests substituídos com abortamento e tokens.
- **Descrição:** Adicionar controle independente para geocoding e forecast, descartando respostas tardias de buscas, seleções e retries anteriores.
- **Critérios de aceite:** Em duas buscas concorrentes, somente a resposta da segunda altera `searchState`; em duas seleções concorrentes, somente o `WeatherData` da segunda permanece; `AbortError` causado por substituição não produz `error` nem alerta na UI.
- **Rastreabilidade:** FR-10, FR-15 / AC-10, NFR-07.
- **Dependências:** T-07, T-15, T-16
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

## Entrega 4 — Interface do MVP

### T-20 — Implementar a barra de busca
- **Título:** Criar `SearchBar` com envio acessível.
- **Descrição:** Criar o componente controlado para consulta, envio por botão ou Enter e validação de espaços.
- **Critérios de aceite:** `getByRole('textbox', { name: ... })` encontra o input; `"  São José d'Oeste  "` é enviado como `"São José d'Oeste"`; `"   "` não chama o callback e mantém `document.activeElement` no input; após erro, o valor digitado continua no campo.
- **Rastreabilidade:** FR-01, FR-12, FR-13 / AC-01, AC-12, AC-13, NFR-02.
- **Dependências:** T-15
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Tipo:** UI

### T-21 — Implementar resultados de localização
- **Título:** Criar lista selecionável de cidades.
- **Descrição:** Criar `LocationResults` para mostrar até cinco cidades, região e país quando disponíveis.
- **Critérios de aceite:** São renderizadas no máximo cinco opções e nenhuma tem seleção inicial; ArrowDown/ArrowUp mudam a opção focada, Enter chama a seleção uma vez e Escape remove a lista; `<script>alert(1)</script>` aparece como texto; `getWeather` não é chamado antes do Enter de seleção.
- **Rastreabilidade:** FR-02, FR-03, FR-12 / AC-02, AC-03, AC-12, NFR-02.
- **Dependências:** T-01, T-16, T-20
- **Arquivos prováveis:** `src/components/LocationResults.tsx`
- **Tipo:** UI

### T-22 — Implementar estados de feedback
- **Título:** Exibir loading, vazio e erro com semântica acessível.
- **Descrição:** Criar `FeedbackState` para busca e forecast, com mensagens pt-BR e retry contextual.
- **Critérios de aceite:** Durante cada request existe exatamente um elemento `role="status"`; erros são encontrados por região de alerta; vazio contém mensagem de cidade não encontrada; retry de busca usa o termo preservado e retry de forecast usa a cidade preservada; estado inicial não renderiza métricas.
- **Rastreabilidade:** FR-07, FR-08, FR-09, FR-11, FR-13 / AC-07, AC-08, AC-09, AC-11, AC-13, NFR-02.
- **Dependências:** T-15, T-16
- **Arquivos prováveis:** `src/components/FeedbackState.tsx`
- **Tipo:** UI

### T-23 — Implementar condições atuais
- **Título:** Criar `CurrentWeather` para os dados do momento.
- **Descrição:** Renderizar cidade, temperatura, sensação, condição, umidade, precipitação, pressão e vento.
- **Critérios de aceite:** Uma fixture com os valores de AC-04 produz `18,5 °C`, `17,2 °C`, `Encoberto`, `70%`, `0,2 mm`, `1013,2 hPa` e `10 km/h`; cada campo ausente e código desconhecido produz `Indisponível`; alternar a unidade altera somente temperaturas.
- **Rastreabilidade:** FR-04, FR-06, FR-14 / AC-04, AC-06, AC-14, NFR-01, NFR-10.
- **Dependências:** T-03, T-04, T-05
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI

### T-24 — Implementar previsão diária
- **Título:** Criar `ForecastList` com exatamente cinco dias.
- **Descrição:** Renderizar datas locais, condição, mínima, máxima e probabilidade de precipitação.
- **Critérios de aceite:** Uma fixture com cinco datas gera exatamente cinco entradas na mesma ordem; cada entrada contém data, condição, mínima, máxima e precipitação; campos ausentes exibem `Indisponível`; datas são formatadas com o timezone da fixture e temperaturas mudam com a unidade.
- **Rastreabilidade:** FR-05, FR-06, FR-14 / AC-05, AC-06, AC-14, NFR-01, NFR-10.
- **Dependências:** T-03, T-04, T-05
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Tipo:** UI

### T-25 — Implementar aviso de segurança
- **Título:** Informar a limitação sobre alertas severos.
- **Descrição:** Adicionar o aviso persistente junto à previsão, sem misturá-lo à lógica de dados meteorológicos.
- **Critérios de aceite:** A string `Este app não fornece alertas meteorológicos severos. Consulte os serviços oficiais da sua região para avisos.` aparece uma vez no conteúdo da previsão após sucesso; não aparece como alerta meteorológico fornecido pelo app.
- **Rastreabilidade:** FR-16 / AC-16.
- **Dependências:** T-24
- **Arquivos prováveis:** `src/components/ForecastNotice.tsx`
- **Tipo:** UI

### T-26 — Implementar controle de unidade
- **Título:** Criar `UnitToggle` acessível.
- **Descrição:** Criar o controle de Celsius/Fahrenheit conectado ao estado de apresentação.
- **Critérios de aceite:** O estado inicial é `celsius`; os controles de ambas as unidades têm nome acessível; a troca por teclado altera current e os cinco dias; o mock de `fetch` mantém zero chamadas adicionais durante a troca.
- **Rastreabilidade:** FR-06 / AC-06, NFR-02, NFR-09.
- **Dependências:** T-03, T-16
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Tipo:** UI

### T-27 — Compor a tela principal
- **Título:** Integrar componentes ao `App`.
- **Descrição:** Conectar `useWeather`, busca, resultados, feedback, unidade, clima atual, previsão e aviso no fluxo da tela.
- **Critérios de aceite:** Um teste integrado observa a sequência busca → resultados → seleção → forecast; ao selecionar B, B substitui A; loading/erro/vazio não exibem métricas antigas; um spy confirma que requests partem somente do hook/serviço.
- **Rastreabilidade:** FR-03, FR-08, FR-09, FR-10, FR-11, FR-15 / AC-03, AC-08, AC-09, AC-10, AC-11.
- **Dependências:** T-15, T-16, T-17, T-20, T-21, T-22, T-23, T-24, T-25, T-26
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

## Entrega 5 — Validação integrada

### T-12 — Testar conversão de unidade
- **Título:** Validar conversão Celsius/Fahrenheit com Vitest.
- **Descrição:** Criar testes unitários dedicados às funções de conversão e formatação de temperatura, sem renderizar componentes nem fazer requests.
- **Critérios de aceite:** Os testes verificam `0 °C → 32,0 °F`, `100 °C → 212,0 °F`, `-40 °C → -40,0 °F`, uma casa decimal, preservação do Celsius não arredondado e `Indisponível` para valor ausente; a suíte termina sem chamadas de rede.
- **Rastreabilidade:** FR-06, FR-14 / AC-06, AC-14, NFR-01, NFR-09.
- **Dependências:** T-02, T-03
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test

### T-40 — Testar funções puras de localização
- **Título:** Cobrir códigos WMO e formatação localizada.
- **Descrição:** Criar testes Vitest para condições meteorológicas, datas, números e timezone, separados dos testes de conversão de unidade.
- **Critérios de aceite:** Testes verificam código WMO conhecido e desconhecido, data no timezone IANA, número com vírgula decimal, horário em 24 horas e valores ausentes como `Indisponível`; a suíte não usa rede.
- **Rastreabilidade:** FR-04, FR-05, FR-14 / AC-04, AC-05, AC-14, NFR-10.
- **Dependências:** T-04, T-05
- **Arquivos prováveis:** `tests/unit/weather-formatting.test.ts`
- **Tipo:** Test

### T-13 — Testar serviço de geocoding
- **Título:** Validar URL, normalização e falhas de localização.
- **Descrição:** Testar `searchCities` com `fetch` mockado, respostas controladas e fixtures locais.
- **Critérios de aceite:** `globalThis.fetch` é substituído por mock; os testes verificam parâmetros, até cinco resultados, ordem, IDs duplicados, lista vazia, erro HTTP, rejeição de rede, timeout, abortamento e payload inválido; nenhuma chamada alcança a API real.
- **Rastreabilidade:** FR-01, FR-02, FR-07, FR-13, FR-15 / AC-01, AC-02, AC-07, AC-10, AC-13, NFR-01, NFR-07, NFR-11.
- **Dependências:** T-07, T-08, T-09
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`
- **Tipo:** Test

### T-14 — Testar serviço de forecast
- **Título:** Validar URL, normalização parcial e falhas meteorológicas.
- **Descrição:** Testar `getWeather` com `fetch` mockado e fixtures de sucesso, campos ausentes/nulos e estruturas inválidas.
- **Critérios de aceite:** `globalThis.fetch` é substituído por mock; os testes verificam todos os parâmetros, cinco datas, mapeamento por índice, `undefined` para campos ausentes, erro HTTP/rede/timeout, abortamento e arrays incompatíveis; nenhuma chamada alcança a API real.
- **Rastreabilidade:** FR-04, FR-05, FR-08, FR-14, FR-15 / AC-04, AC-05, AC-08, AC-10, AC-14, NFR-01, NFR-07.
- **Dependências:** T-07, T-10, T-11
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`
- **Tipo:** Test

### T-18 — Testar estados básicos do hook
- **Título:** Cobrir fluxo normal, vazio, erro e retry.
- **Descrição:** Testar `useWeather` com serviços mockados para os fluxos de busca e previsão.
- **Critérios de aceite:** Os testes fazem asserções para `idle`, `loading`, `success`, `empty` e `error`; verificam a consulta/cidade preservada, a remoção dos dados anteriores, uma nova chamada em cada retry e ausência de clima antes da seleção.
- **Rastreabilidade:** FR-07, FR-08, FR-09, FR-11, FR-13 / AC-07, AC-08, AC-09, AC-11, AC-13.
- **Dependências:** T-15, T-16
- **Arquivos prováveis:** `tests/components/useWeather.test.tsx`
- **Tipo:** Test

### T-19 — Testar concorrência e unidade do hook
- **Título:** Validar respostas obsoletas e zero requests ao alternar unidade.
- **Descrição:** Testar tokens, abortamento, relógio controlado e derivação de Celsius/Fahrenheit no hook.
- **Critérios de aceite:** Fixtures A/B resolvidas fora de ordem deixam B visível; abortamento não altera o estado para erro; com relógio controlado, `role="status"` aparece em até 200 ms; dez alternâncias após sucesso mantêm o contador de requests inalterado.
- **Rastreabilidade:** FR-11, FR-15 / AC-10, AC-11, NFR-05, NFR-09.
- **Dependências:** T-03, T-17, T-18
- **Arquivos prováveis:** `tests/components/useWeather-concurrency.test.tsx`
- **Tipo:** Test

### T-28 — Testar busca e resultados
- **Título:** Cobrir interação de busca e seleção.
- **Descrição:** Testar `SearchBar` e `LocationResults` com Testing Library e `user-event`.
- **Critérios de aceite:** Os testes acionam botão e Enter; confirmam zero chamadas para entrada vazia; verificam o termo `São José d'Oeste` sem alteração interna; confirmam ArrowUp/ArrowDown, Enter, Escape e ausência de seleção automática.
- **Rastreabilidade:** FR-01, FR-02, FR-03, FR-07, FR-12 / AC-01, AC-02, AC-03, AC-07, AC-12, NFR-02.
- **Dependências:** T-20, T-21
- **Arquivos prováveis:** `tests/components/SearchBar.test.tsx`, `tests/components/LocationResults.test.tsx`
- **Tipo:** Test

### T-29 — Testar feedback e segurança de texto
- **Título:** Cobrir estados acessíveis e conteúdo literal.
- **Descrição:** Testar componentes de feedback nos estados loading, erro e vazio, incluindo retry, roles e termos contendo marcação potencial.
- **Critérios de aceite:** Há asserção para loading por `role="status"`, erro por região de alerta e vazio por mensagem de cidade não encontrada; os botões de retry de busca/forecast chamam somente sua ação; `querySelector('script')` não encontra elemento criado a partir do termo malicioso.
- **Rastreabilidade:** FR-07, FR-08, FR-11, FR-12, FR-13 / AC-07, AC-08, AC-11, AC-12, AC-13, NFR-02.
- **Dependências:** T-22
- **Arquivos prováveis:** `tests/components/FeedbackState.test.tsx`
- **Tipo:** Test

### T-30 — Testar exibição meteorológica
- **Título:** Cobrir clima atual, previsão e unidade.
- **Descrição:** Testar componentes de dados com fixtures válidas, parciais e desconhecidas.
- **Critérios de aceite:** Asserções cobrem os sete campos atuais, exatamente cinco dias, formatos `pt-BR`, `Indisponível`, condição WMO, aviso literal e conversão de `0 °C`/`100 °C`; um mock de rede confirma zero requests na troca C/F.
- **Rastreabilidade:** FR-04, FR-05, FR-06, FR-14, FR-16 / AC-04, AC-05, AC-06, AC-14, AC-16, NFR-09, NFR-10.
- **Dependências:** T-03, T-04, T-05, T-23, T-24, T-25, T-26
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/ForecastList.test.tsx`
- **Tipo:** Test

### T-31 — Testar composição da aplicação
- **Título:** Validar o fluxo integrado da tela.
- **Descrição:** Renderizar `App` com serviços mockados e verificar as transições principais.
- **Critérios de aceite:** O teste faz asserções para estado inicial, loading, sucesso, nova busca, erro e retry; após selecionar A e depois B, o nome e a previsão visíveis são exclusivamente de B; o retry incrementa a chamada do serviço uma vez.
- **Rastreabilidade:** FR-03, FR-08, FR-09, FR-10, FR-11, FR-13, FR-15 / AC-03, AC-08, AC-09, AC-10, AC-11, AC-13.
- **Dependências:** T-27, T-28, T-29, T-30
- **Arquivos prováveis:** `tests/components/App.test.tsx`
- **Tipo:** Test

### T-32 — Criar E2E do fluxo feliz
- **Título:** Validar jornada principal em desktop e mobile.
- **Descrição:** Criar fixture interceptada para geocoding e forecast e executar a consulta bem-sucedida em viewport desktop e mobile.
- **Critérios de aceite:** Com `page.route`, o E2E intercepta geocoding e forecast; em pelo menos 1280 px e 320 px, localiza o resultado, seleciona uma cidade, verifica condições atuais e cinco dias, alterna C/F e conclui uma nova busca; nenhuma rota externa real é necessária.
- **Rastreabilidade:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-10 / AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-10.
- **Dependências:** T-27
- **Arquivos prováveis:** `tests/e2e/weather-app-happy-path.spec.ts`, `tests/e2e/fixtures/weather.ts`
- **Tipo:** Test

### T-33 — Criar E2E de falhas e recuperação
- **Título:** Validar erro, timeout, retry e resposta parcial.
- **Descrição:** Interceptar falhas de geocoding/forecast e fixtures meteorológicas parciais.
- **Critérios de aceite:** Rotas determinísticas produzem erro de busca, timeout/erro de forecast e resposta parcial; o E2E encontra alerta, termo/cidade preservados, executa retry bem-sucedido e retry que continua falhando; campos ausentes exibem `Indisponível`.
- **Rastreabilidade:** FR-08, FR-11, FR-13, FR-14 / AC-08, AC-11, AC-13, AC-14, NFR-07.
- **Dependências:** T-22, T-27
- **Arquivos prováveis:** `tests/e2e/weather-app-recovery.spec.ts`, `tests/e2e/fixtures/weather.ts`
- **Tipo:** Test

### T-34 — Criar E2E de localização e segurança
- **Título:** Validar idioma, texto literal e aviso de segurança.
- **Descrição:** Verificar requisitos de localização e limite do produto em um fluxo determinístico.
- **Critérios de aceite:** O E2E verifica `document.documentElement.lang === 'pt-BR'`; mensagens e condições esperadas estão em pt-BR; termo com marcação não cria `script`; a previsão contém a string exata de AC-16.
- **Rastreabilidade:** FR-12, FR-16 / AC-12, AC-15, AC-16, NFR-10, NFR-11.
- **Dependências:** T-25, T-27
- **Arquivos prováveis:** `tests/e2e/weather-app-content.spec.ts`
- **Tipo:** Test

### T-35 — Validar responsividade
- **Título:** Executar matriz de viewports do MVP.
- **Descrição:** Criar cenários Playwright para 320, 768, 1024 e 1920 px executando a jornada completa (busca → seleção → unidade → previsão) com as mesmas fixtures interceptadas por `page.route`.
- **Matriz:**

  | Viewport | Perfil         | Altura |
  | -------- | -------------- | ------ |
  | 320 px   | mobile pequeno | 640    |
  | 768 px   | tablet         | 1024   |
  | 1024 px  | desktop        | 768    |
  | 1920 px  | desktop amplo  | 1080   |

- **Critérios de aceite:**
  - Em cada viewport, `document.documentElement.scrollWidth <= document.documentElement.clientWidth` é verificado no estado inicial, com a lista de opções aberta, após a seleção e após alternar a unidade.
  - Input, botão `Buscar` e toggle °C/°F ficam visíveis e inteiramente dentro da largura do viewport.
  - Cada opção da lista fica dentro do viewport e não corta texto (`scrollWidth <= clientWidth`), inclusive com nome de cidade e país longos sem espaços.
  - Selecionar a cidade exibe o clima atual e os cinco dias, todos dentro da largura do viewport.
  - Alternar para °F atualiza clima atual e previsão sem gerar rolagem horizontal.
  - Uma nova busca com nome longo exibe o título quebrado dentro do viewport.
  - As mesmas fixtures são usadas em todos os viewports e a matriz roda em todos os projetos do Playwright.
- **Rastreabilidade:** NFR-02, NFR-03 / AC-11.
- **Dependências:** T-31, T-32
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`
- **Tipo:** Test

### T-36 — Validar acessibilidade e navegadores
- **Título:** Cobrir teclado, foco, contraste e matriz de browsers.
- **Descrição:** Executar os cenários Playwright nos navegadores configurados e registrar a revisão manual de WCAG 2.2 AA.
- **Critérios de aceite:** E2E executa Tab, setas, Enter e Escape e verifica o elemento focado; labels e roles esperados são encontrados; a checagem de contraste não tem violações AA; `docs/compatibility-matrix.md` lista versões e dispositivos testados para Chrome, Edge, Firefox e Safari.
- **Rastreabilidade:** NFR-02, NFR-04 / AC-02, AC-03, AC-11, AC-15.
- **Dependências:** T-28, T-29, T-35
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`, `docs/compatibility-matrix.md`
- **Tipo:** Test

## Entrega 6 — Hardening e release

### T-37 — Executar gates automatizados do repositório
- **Título:** Rodar lint, build, testes unitários e E2E.
- **Descrição:** Executar os comandos oficiais do projeto e registrar falhas introduzidas pelo MVP.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com código 0; os testes passam sem conexão com Open-Meteo; cada warning restante tem decisão registrada no relatório da tarefa.
- **Rastreabilidade:** NFR-04, NFR-06, NFR-07, NFR-11 / gates do plano técnico.
- **Dependências:** T-13, T-14, T-19, T-31, T-34, T-36
- **Arquivos prováveis:** `package.json`, `biome.json`, arquivos alterados em `src/` e `tests/`
- **Tipo:** Infra

### T-38 — Medir desempenho do produto
- **Título:** Separar latência do provedor e da aplicação.
- **Descrição:** Registrar ambiente, rede, tempo do provedor e tempo do produto para validar a meta p95 definida na spec.
- **Critérios de aceite:** O relatório registra dataset, navegador, ambiente e rede; cada amostra separa duração do request Open-Meteo e duração total do produto; com provedor até 2,5 s, o relatório calcula p95 e marca `pass` somente se for até 3 s.
- **Rastreabilidade:** NFR-04, NFR-06 / gates de desempenho do plano técnico.
- **Dependências:** T-35, T-37
- **Arquivos prováveis:** `docs/performance-validation.md`
- **Tipo:** Infra

### T-39 — Verificar requisitos do provedor
- **Título:** Registrar termos, limites e atribuição da Open-Meteo.
- **Descrição:** Fechar o gate de publicação sem alterar o escopo do cliente.
- **Critérios de aceite:** `docs/release-validation.md` registra fonte e data da verificação de termos, limites e atribuição, com status `confirmed` ou `pending`; uma revisão confirma ausência de cache, persistência, analytics, logs de consulta e localização automática.
- **Rastreabilidade:** NFR-01, NFR-08, NFR-11 / gate de publicação e riscos do plano técnico.
- **Dependências:** T-37
- **Arquivos prováveis:** `docs/release-validation.md`
- **Tipo:** Infra

## Rastreabilidade dos requisitos funcionais

| Requisito | Tarefas que implementam ou validam | Status |
| --- | --- | --- |
| FR-01 — Buscar cidade | T-09, T-15, T-20, T-28, T-32 | Coberto |
| FR-02 — Apresentar opções de localização | T-08, T-09, T-21, T-28, T-32 | Coberto |
| FR-03 — Selecionar cidade | T-08, T-16, T-21, T-27, T-28, T-31, T-32 | Coberto |
| FR-04 — Exibir condições atuais | T-10, T-11, T-16, T-23, T-30, T-32 | Coberto |
| FR-05 — Exibir previsão diária | T-10, T-11, T-24, T-30, T-32 | Coberto |
| FR-06 — Alternar unidade de temperatura | T-02, T-03, T-12, T-16, T-26, T-30, T-32 | Coberto |
| FR-07 — Informar cidade não encontrada | T-09, T-15, T-22, T-29, T-33 | Coberto |
| FR-08 — Informar falha meteorológica e permitir nova tentativa | T-07, T-11, T-16, T-22, T-29, T-33, T-37 | Coberto |
| FR-09 — Estado inicial ou vazio | T-06, T-16, T-22, T-27, T-31 | Coberto |
| FR-10 — Nova busca | T-15, T-16, T-17, T-27, T-31, T-32 | Coberto |
| FR-11 — Estado de carregamento | T-15, T-22, T-29, T-31, T-33 | Coberto |
| FR-12 — Validar a consulta de cidade | T-15, T-20, T-21, T-28, T-29, T-34 | Coberto |
| FR-13 — Recuperar falhas de geocoding | T-07, T-09, T-15, T-22, T-29, T-33 | Coberto |
| FR-14 — Tratar respostas meteorológicas parciais | T-10, T-11, T-23, T-24, T-30, T-33, T-40 | Coberto |
| FR-15 — Ignorar resposta obsoleta | T-07, T-17, T-19, T-27, T-31, T-33 | Coberto |
| FR-16 — Comunicar limite de segurança | T-25, T-30, T-34 | Coberto |

**Requisitos funcionais sem tarefa correspondente:** nenhum identificado.

## Rastreabilidade detalhada

| Requisito / critério | Tarefas principais |
| --- | --- |
| FR-01, FR-07, FR-10, FR-12 / AC-01, AC-07, AC-10, AC-12 | T-08, T-09, T-15, T-20, T-21, T-27, T-28, T-32, T-34 |
| FR-02, FR-03 / AC-02, AC-03 | T-01, T-08, T-09, T-16, T-21, T-28, T-31, T-32 |
| FR-04, FR-05, FR-14 / AC-04, AC-05, AC-14 | T-04, T-05, T-10, T-11, T-23, T-24, T-25, T-30, T-33, T-40 |
| FR-06 / AC-06 | T-02, T-03, T-12, T-16, T-19, T-26, T-30, T-32 |
| FR-08, FR-11, FR-13 / AC-08, AC-11, AC-13 | T-07, T-15, T-16, T-22, T-29, T-33 |
| FR-09 / AC-09 | T-06, T-16, T-22, T-27, T-31 |
| FR-15 / AC-10 | T-07, T-15, T-17, T-19, T-27, T-31, T-33 |
| FR-16 / AC-16 | T-25, T-30, T-34 |
| NFR-01, NFR-07 | T-07, T-09, T-10, T-11, T-12, T-13, T-14 |
| NFR-02, NFR-03, NFR-10 | T-05, T-06, T-20, T-21, T-22, T-27, T-34, T-35, T-36 |
| NFR-04, NFR-06 | T-35, T-36, T-38 |
| NFR-05, NFR-09, NFR-11 | T-15, T-16, T-19, T-26, T-37, T-39 |

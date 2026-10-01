# Overview

O Weather App é uma aplicação web responsiva, em português do Brasil, para buscar uma cidade e consultar condições atuais e previsão diária de hoje mais os quatro dias seguintes. O MVP consulta diretamente os endpoints públicos de geocoding e previsão da Open-Meteo, sem conta ou chave fornecida pelo usuário. A unidade inicial é Celsius; a pessoa pode alternar para Fahrenheit sem nova chamada de rede.

O MVP não tem autenticação, persistência local ou no servidor, localização automática nem alertas severos. A busca é global e explícita (botão ou Enter). Os dados são apresentados no fuso local retornado para as coordenadas da cidade. As personas são hipóteses de discovery, não pesquisa validada.

**Status:** development-ready para implementar o MVP definido nesta especificação. Isso não equivale a aprovação de release: condições de uso e atribuição da Open-Meteo devem ser verificadas antes da publicação.

**Validação de prontidão:** “esta spec é suficiente para desenvolver sem novas perguntas?” **Sim.** Os requisitos de MVP têm decisões padrão e critérios verificáveis abaixo; as validações de produto e publicação restantes não bloqueiam o desenvolvimento.

## Personas hipotéticas

- **Camila, consulta rápida antes de sair:** quer identificar a cidade correta e consultar condições atuais e próximos dias, principalmente no celular. A hipótese de sucesso do discovery é concluir a consulta em até 30 segundos sem selecionar um local errado; essa métrica ainda não foi validada.
- **Rafael, planejamento de viagem:** quer consultar uma cidade por vez e identificar as condições e datas dos cinco dias, principalmente no desktop. A hipótese de sucesso é concluir a consulta sem recorrer a outra fonte para interpretar os dados; ela ainda não foi validada.
- **Luiza, usuária de Fahrenheit:** quer alternar para a unidade com que está acostumada e interpretar as temperaturas sem conversão externa. A hipótese de sucesso é que todas as temperaturas visíveis correspondam à unidade escolhida; ela ainda não foi validada.

# Functional Requirements

Cada requisito funcional tem ao menos um critério de aceite associado na seção **Acceptance Criteria**.

- **FR-01 — Buscar cidade:** O usuário deve poder informar o nome de uma cidade para iniciar uma busca.
  - Critérios: AC-01.
- **FR-02 — Apresentar opções de localização:** Quando a busca retornar uma ou mais cidades, o sistema deve apresentar cada resultado como opção selecionável, identificando cidade, região e país quando esses dados forem fornecidos.
  - Critérios: AC-02.
- **FR-03 — Selecionar cidade:** O usuário deve poder selecionar uma cidade encontrada para consultar seus dados meteorológicos.
  - Critérios: AC-03.
- **FR-04 — Exibir condições atuais:** Para a cidade selecionada, o sistema deve exibir temperatura, sensação térmica, condição, umidade relativa, precipitação, pressão ao nível do mar e velocidade do vento. Cada valor ausente deve seguir FR-14.
  - Critérios: AC-04.
- **FR-05 — Exibir previsão diária:** Para a cidade selecionada, o sistema deve exibir cinco dias locais consecutivos, incluindo hoje, com data, condição, temperaturas mínima e máxima e probabilidade máxima de precipitação. Cada valor ausente deve seguir FR-14.
  - Critérios: AC-05.
- **FR-06 — Alternar unidade de temperatura:** O sistema deve iniciar em Celsius e permitir alternar a apresentação de temperaturas entre Celsius e Fahrenheit.
  - Critérios: AC-06.
- **FR-07 — Informar cidade não encontrada:** Se a busca não encontrar uma cidade, o sistema deve informar esse resultado ao usuário.
  - Critérios: AC-07.
- **FR-08 — Informar falha meteorológica e permitir nova tentativa:** Se a consulta de condições atuais ou previsão falhar, expirar ou retornar erro, o sistema deve comunicar a falha, manter a cidade selecionada e permitir nova tentativa manual.
  - Critérios: AC-08.
- **FR-09 — Estado inicial ou vazio:** Antes de uma cidade ser selecionada, o sistema deve apresentar um estado inicial ou vazio, em vez de dados meteorológicos atribuídos a uma cidade não selecionada.
  - Critérios: AC-09.
- **FR-10 — Nova busca:** Depois de uma consulta, o usuário deve poder realizar uma busca por outra cidade.
  - Critérios: AC-10.
- **FR-11 — Estado de carregamento:** Enquanto aguarda resposta de geocoding ou de dados meteorológicos, o sistema deve apresentar um estado de carregamento.
  - Critérios: AC-11.
- **FR-12 — Validar a consulta de cidade:** O sistema deve impedir o envio de uma consulta vazia ou composta somente por espaços, remover espaços externos de uma consulta válida e preservar acentos e pontuação válida no nome da cidade.
  - Critérios: AC-12.
- **FR-13 — Recuperar falhas de geocoding:** Se a busca de localização falhar ou expirar, o sistema deve informar o erro, preservar o texto pesquisado e permitir nova tentativa manual.
  - Critérios: AC-13.
- **FR-14 — Tratar respostas meteorológicas parciais:** O sistema deve apresentar os campos válidos recebidos, identificar cada campo ausente como “Indisponível” e nunca inventar ou reutilizar dados de outra cidade. Resposta malformada ou incompatível com o contrato é falha, não resposta parcial.
  - Critérios: AC-14.
- **FR-15 — Ignorar resposta obsoleta:** O sistema deve ignorar respostas tardias de geocoding ou previsão que pertençam a uma busca ou seleção substituída por uma ação mais recente.
  - Critérios: AC-10.
- **FR-16 — Comunicar limite de segurança:** A interface deve informar que o produto não fornece alertas meteorológicos severos e direcionar a pessoa a consultar fontes oficiais locais para avisos.
  - Critérios: AC-16.

# User Stories

As personas são hipóteses a validar com usuários reais. Cada história indica os
IDs de requisito relacionados.

- **US-01 — Encontrar uma cidade:** Como Camila, quero buscar uma cidade e escolher entre resultados compatíveis para consultar o local correto sem ambiguidade. **Requisitos relacionados:** FR-01, FR-02, FR-03, FR-07, FR-12.
- **US-02 — Consultar o tempo:** Como Camila, quero ver as condições atuais e a previsão diária da cidade selecionada para decidir o que vestir ou levar. **Requisitos relacionados:** FR-04, FR-05, FR-14.
- **US-03 — Planejar atividades:** Como Rafael, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar atividades e bagagem com antecedência. **Requisitos relacionados:** FR-05, FR-14.
- **US-04 — Usar a unidade familiar:** Como Luiza, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas sem fazer conversões mentais. **Requisito relacionado:** FR-06.
- **US-05 — Acompanhar uma consulta:** Como Camila, quero ver quando a busca está carregando e receber uma mensagem com opção de tentar novamente se ela falhar para saber o que está acontecendo. **Requisitos relacionados:** FR-08, FR-11, FR-13.
- **US-06 — Começar uma consulta:** Como Camila, quero ver um estado inicial claro antes de selecionar uma cidade para entender que ainda preciso iniciar uma busca. **Requisito relacionado:** FR-09.
- **US-07 — Consultar outra cidade:** Como Rafael, quero iniciar uma nova busca após consultar uma cidade para avaliar outro destino sem reiniciar a experiência. **Requisitos relacionados:** FR-10, FR-15.
- **US-08 — Usar a interface em português:** Como Camila, quero ler rótulos e mensagens em português do Brasil para compreender a busca e os resultados. **Requisito relacionado:** NFR-10.
- **US-09 — Entender os limites dos dados:** Como Camila, quero saber que o app não fornece alertas severos para consultar uma fonte oficial quando precisar de avisos. **Requisito relacionado:** FR-16.

# Acceptance Criteria

- **AC-01 (FR-01, US-01)**
  - **Given** que a tela de busca está disponível
  - **When** a pessoa envia uma consulta válida pelo controle de busca ou pela tecla Enter
  - **Then** o sistema inicia uma solicitação de geocoding para a consulta normalizada.
- **AC-02 (FR-02, US-01)**
  - **Given** que a consulta de localização retorna uma ou mais cidades compatíveis
  - **When** os resultados são apresentados
  - **Then** são apresentados no máximo cinco resultados, na ordem do provedor, uma vez cada, como opções selecionáveis; cada opção mostra cidade e, quando fornecidos, região e país. Nenhum resultado é selecionado automaticamente, mesmo se houver apenas um.
- **AC-03 (FR-03, US-01)**
  - **Given** que os resultados contêm duas cidades com identificadores e dados de previsão distintos
  - **When** a pessoa seleciona uma cidade
  - **Then** o sistema limpa imediatamente os dados meteorológicos da seleção anterior, solicita dados pelo identificador da cidade escolhida e apresenta somente dados associados a ela.
- **AC-04 (FR-04, US-02)**
  - **Given** que a resposta da cidade selecionada contém temperatura `18.5`, sensação térmica `17.2`, `weather_code=3`, umidade `70`, precipitação `0.2`, pressão `1013.2` e vento `10`
  - **When** os dados atuais terminam de carregar
  - **Then** a interface exibe `18,5 °C`, `17,2 °C`, `Encoberto`, `70%`, `0,2 mm`, `1013,2 hPa` e `10 km/h` associados à cidade selecionada.
- **AC-05 (FR-05, US-02, US-03)**
  - **Given** que uma cidade foi selecionada e a fixture fornece cinco datas consecutivas no fuso local retornado pela API
  - **When** a previsão termina de carregar
  - **Then** a interface exibe exatamente cinco entradas na ordem da resposta, com data, condição, mínima, máxima e probabilidade máxima de precipitação; valores numéricos usam as unidades e o formato definidos em AC-04 e AC-06.
- **AC-06 (FR-06, US-04)**
  - **Given** que a interface apresenta temperaturas e a unidade inicial é Celsius
  - **When** a pessoa alterna a unidade para Fahrenheit
  - **Then** a unidade indicada muda para Fahrenheit, os valores atuais e diários são convertidos a partir dos valores Celsius não arredondados e apresentados com uma casa decimal; 0 °C e 100 °C resultam em 32,0 °F e 212,0 °F.
  - **Given** que os mesmos valores estão apresentados em Fahrenheit
  - **When** a pessoa alterna a unidade para Celsius
  - **Then** os valores voltam a 0,0 °C e 100,0 °C, respectivamente.
- **AC-07 (FR-07, US-01)**
  - **Given** que a consulta de localização retorna zero cidades
  - **When** os resultados da busca são apresentados
  - **Then** a interface informa que nenhuma cidade foi encontrada e não exibe dados meteorológicos de uma cidade não selecionada.
- **AC-08 (FR-08, US-05)**
  - **Given** que uma consulta de dados meteorológicos falha
  - **When** o sistema apresenta o estado de erro
  - **Then** a interface comunica a falha com semântica de alerta acessível, mantém a cidade selecionada e disponibiliza uma ação de nova tentativa operável por teclado.
  - **Given** que uma solicitação meteorológica permanece sem resposta
  - **When** 10 segundos se passam desde o início da solicitação
  - **Then** a solicitação termina, o indicador de carregamento desaparece e o estado de erro com nova tentativa é apresentado.
  - **Given** que o estado de erro oferece a ação de nova tentativa
  - **When** a pessoa aciona essa ação e a consulta seguinte retorna dados válidos
  - **Then** o estado de erro é removido e os dados da cidade selecionada são exibidos.
  - **Given** que a consulta seguinte também falha
  - **When** a resposta de erro é apresentada
  - **Then** o estado de erro permanece visível e a ação de nova tentativa continua disponível.
- **AC-09 (FR-09, US-06)**
  - **Given** que nenhuma cidade foi selecionada
  - **When** a interface é aberta ou retorna ao estado sem seleção
  - **Then** um estado inicial ou vazio é exibido e nenhuma condição meteorológica é atribuída a uma cidade.
- **AC-10 (FR-10, FR-15, US-07)**
  - **Given** que os dados da cidade A estão sendo exibidos
  - **When** a pessoa busca e seleciona a cidade B
  - **Then** após a consulta da cidade B concluir, a cidade selecionada e os dados apresentados correspondem à cidade B.
  - **Given** que uma busca ou consulta de A ainda está pendente quando a pessoa inicia uma busca ou seleciona B
  - **When** a resposta de B chega antes da resposta atrasada de A
  - **Then** somente os resultados e dados associados à ação mais recente podem atualizar a interface; a resposta tardia de A não substitui a consulta atual.
- **AC-11 (FR-11, US-05)**
  - **Given** que uma busca de localização ou dados meteorológicos foi iniciada
  - **When** a resposta correspondente ainda não chegou
  - **Then** a interface exibe em até 200 ms um indicador de carregamento com semântica de status acessível.
- **AC-12 (FR-12, US-01)**
  - **Given** que o campo de cidade contém somente espaços em branco
  - **When** a pessoa envia a busca pelo controle ou pela tecla Enter
  - **Then** nenhuma solicitação de geocoding é enviada, o campo permanece disponível e a interface solicita um nome de cidade.
  - **Given** que o campo contém `  São José d'Oeste  `
  - **When** a pessoa envia a busca
  - **Then** a solicitação de geocoding recebe `São José d'Oeste`, preservando acentos e apóstrofo e removendo apenas espaços externos.
  - **Given** que uma busca sem resultados contém `<script>alert(1)</script>` como termo
  - **When** a interface apresenta o termo no estado sem resultados
  - **Then** o termo aparece como texto literal e nenhum elemento `script` executável é criado.
  - **Given** que um nome pesquisado contém caracteres que poderiam ser interpretados como marcação
  - **When** o termo é exibido na interface
  - **Then** ele é tratado como texto e nenhum elemento ou script do termo é executado.
- **AC-13 (FR-13, US-05)**
  - **Given** que uma solicitação de geocoding falha ou excede o timeout de 10 segundos
  - **When** a falha é detectada
  - **Then** o loading termina, uma mensagem de erro é exibida, o texto pesquisado permanece no campo e existe uma ação de nova tentativa.
  - **Given** que a pessoa aciona a nova tentativa de geocoding
  - **When** a nova solicitação começa
  - **Then** o estado de loading é exibido e o termo preservado é enviado novamente.
- **AC-14 (FR-14, US-02, US-03)**
  - **Given** que uma resposta meteorológica contém alguns campos válidos e outros ausentes
  - **When** os dados são apresentados
  - **Then** cada campo válido é exibido, cada campo ausente exibe `Indisponível` e nenhum valor de outra cidade ou consulta é reutilizado.
- **AC-15 (NFR-10, US-08)**
  - **Given** que a interface é carregada em qualquer estado especificado
  - **When** o documento e as mensagens são inspecionados
  - **Then** o documento declara `lang="pt-BR"` e todos os textos visíveis, inclusive condições meteorológicas, mensagens e aviso de segurança, estão em pt-BR.
- **AC-16 (FR-16)**
  - **Given** que a previsão de uma cidade está visível
  - **When** a pessoa consulta o conteúdo da previsão
  - **Then** um aviso persistente e legível junto à previsão informa: `Este app não fornece alertas meteorológicos severos. Consulte os serviços oficiais da sua região para avisos.`

# Non-Functional Requirements

- **NFR-01 — Fonte e contrato de dados:** O cliente consulta Open-Meteo Geocoding com `name`, `count=5`, `language=pt` e formato JSON. Para previsão, solicita `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,pressure_msl,wind_speed_10m` e `daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max`, além das coordenadas selecionadas, `timezone=auto`, `forecast_days=5`, `temperature_unit=celsius`, `wind_speed_unit=kmh` e `precipitation_unit=mm`. Os códigos `weather_code` seguem a tabela WMO 0–99, com descrições em pt-BR; código desconhecido é `Indisponível`. A interface mantém os valores Celsius recebidos como fonte para conversão local. Não há chave secreta no cliente.
- **NFR-02 — Acessibilidade:** A interface atende WCAG 2.2 nível AA. Busca e alternância têm rótulos acessíveis; resultados podem ser percorridos por teclado (setas), selecionados por Enter e dispensados por Escape; foco é visível; loading usa `role="status"` e erros usam região de alerta. Contraste atende AA. A verificação automatizada e manual integra o plano de testes.
- **NFR-03 — Responsividade:** Em toda largura de viewport entre 320 px e 1920 px, não há rolagem horizontal e busca, seleção, alternância de unidade e resultados permanecem utilizáveis. A validação automatizada deve cobrir ao menos 320, 768, 1024 e 1920 px.
- **NFR-04 — Compatibilidade:** O release suporta as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari disponíveis na data de congelamento da release. A matriz concreta de versões e dispositivos deve ser registrada no plano de testes.
- **NFR-05 — Feedback de carregamento:** Um indicador de carregamento torna-se visível até 200 ms após o envio de busca de localização ou meteorologia, medido a partir do evento de envio com relógio de teste controlado.
- **NFR-06 — Tempo de resultados:** Se o provedor responder em até 2,5 s, os resultados devem estar visíveis em até 3 s no percentil 95. A medição deve separar latência do provedor e do produto; conjunto de teste, rede e ambiente precisam ser aprovados antes do release.
- **NFR-07 — Timeout:** Cada solicitação externa termina em no máximo 10 s. Ao expirar, aplica-se o estado de falha definido em FR-08 ou FR-13; nenhuma solicitação pendente deixa loading ativo além desse limite.
- **NFR-08 — Disponibilidade:** O MVP é uma aplicação web cliente sem serviço próprio; esta especificação não define SLO de hospedagem nem disponibilidade ponta a ponta. Falhas do provedor devem seguir FR-08 e FR-13. Uma meta operacional é decisão de operação pós-MVP, não requisito para implementar o cliente.
- **NFR-09 — Alternância de unidade:** Alternar Celsius/Fahrenheit não inicia novas solicitações de geocoding nem meteorológicas. Em teste com contadores de chamadas, alternar a unidade dez vezes após carregar os dados resulta em zero chamadas adicionais.
- **NFR-10 — Localização:** O documento declara `lang="pt-BR"`; strings visíveis, descrições meteorológicas e mensagens são pt-BR. Datas são formatadas com convenção brasileira no fuso local IANA retornado por `timezone=auto`; horas usam relógio de 24 horas quando apresentadas.
- **NFR-11 — Privacidade:** Não solicitar localização do dispositivo, não persistir consultas/cidades/unidade no cliente ou servidor e não coletar analytics no MVP. O nome pesquisado e as coordenadas selecionadas são enviados à Open-Meteo para executar a consulta; não registrar esses valores em logs da aplicação.

# Edge Cases

- **Input vazio ou só com espaços:** Ao enviar uma busca sem texto útil, a aplicação não chama geocoding, mantém o foco no campo e exibe uma mensagem pedindo o nome da cidade (AC-12).
- **Caracteres especiais no nome da cidade:** A aplicação preserva acentos, espaços internos, hífens e apóstrofos; remove apenas espaços externos antes da consulta. O texto é exibido como texto, nunca interpretado como marcação (AC-12).
- **Cidade inexistente ou geocoding sem resultados:** Se geocoding responder com sucesso e lista vazia, a aplicação informa que não encontrou a cidade, não chama o serviço meteorológico e mantém o termo editável (AC-07).
- **Busca ambígua:** Mais de uma cidade pode corresponder ao termo. Apresentar até cinco resultados globais na ordem do provedor, identificando cidade, região e país quando disponíveis; exigir seleção explícita (AC-02).
- **Falha de geocoding:** Se geocoding retornar erro de rede/serviço ou exceder 10 s, a aplicação encerra loading, preserva a consulta, informa a falha e permite nova tentativa manual (AC-13).
- **Falha de API ou de rede:** Se uma solicitação falhar ou o provedor retornar erro, a aplicação encerra o estado de carregamento, informa que os dados não puderam ser obtidos, mantém a cidade selecionada e oferece uma nova tentativa. Não apresenta valores inventados nem trata dados antigos como atuais.
- **Timeout:** Se uma solicitação externa não responder em até 10 segundos, a aplicação a encerra, remove o indicador de carregamento, informa a falha e oferece nova tentativa para a mesma cidade.
- **Resposta parcial da API:** A aplicação exibe cada campo válido e mostra `Indisponível` para cada campo ausente; não inventa valores nem reutiliza dados de outra cidade ou consulta (AC-14).
- **Resposta inválida da API:** Se a resposta não puder ser interpretada como dados meteorológicos válidos, a aplicação trata a consulta como falha, informa o problema e oferece nova tentativa (AC-08).
- **Buscas concorrentes ou antigas:** Se uma resposta de busca anterior chegar após uma seleção mais recente, ela não substitui a cidade nem os dados atualmente exibidos (AC-10).
- **Ausência de dados na previsão:** A aplicação não mostra valores meteorológicos fabricados; os campos ausentes são identificados como indisponíveis. Caso não haja dados para um ou mais dias, mantém as datas da previsão e comunica a indisponibilidade dos dados correspondentes.
- **Datas e fuso horário:** Usar o fuso IANA retornado pelo provedor para a cidade; exibir exatamente os cinco valores de `daily.time` na ordem da resposta, inclusive em transições de horário de verão.
- **Código meteorológico desconhecido:** Exibir `Indisponível` para a condição sem impedir a apresentação dos demais campos válidos.
- **Troca de unidade:** Converter todas as temperaturas atuais e diárias com $F = C \times 9/5 + 32$, arredondar somente para exibição a uma casa decimal e não fazer novas chamadas.
- **Offline e cache:** Sem conexão, apresentar erro e retry manual; não apresentar cache nem dados antigos como atuais.
- **Resposta sem campos utilizáveis:** Se a resposta JSON não tiver a estrutura contratada, tratar como falha; se for estruturalmente válida mas todos os valores opcionais estiverem ausentes, mostrar `Indisponível` em cada campo e manter datas e cidade.

# Assumptions

- A busca é iniciada explicitamente por botão ou tecla Enter; não há busca enquanto a pessoa digita.
- Espaços externos são removidos da consulta; acentos, hífens, apóstrofos e espaços internos são preservados.
- A busca é global, solicita até cinco resultados e exige seleção explícita; não há seleção automática.
- A previsão usa o fuso local IANA da cidade (`timezone=auto`), Celsius na API, vento em km/h e precipitação em mm; temperaturas são exibidas com uma casa decimal.
- Falhas permitem nova tentativa manual, sem retry automático; solicitações antigas são canceladas ou descartadas.
- A consulta é feita do navegador para a Open-Meteo; a aplicação não coleta analytics nem persiste dados de busca.
- Os dados são obtidos ao selecionar uma cidade e em retry manual; não há atualização automática em segundo plano.
- O aviso de segurança aparece junto à previsão com o texto definido em AC-16.
- Se uma resposta não tiver dados válidos, a aplicação informa indisponibilidade em vez de inventar ou reutilizar valores.
- Não se presume suporte offline, cache, localização automática nem persistência local.
- Personas e métricas associadas são hipóteses de discovery, não resultados de pesquisa validados.

# Risks

As probabilidades são estimativas iniciais do discovery para o MVP e devem ser revistas quando público, métricas e condições operacionais forem definidos.

| Risco | Probabilidade | Impacto | Mitigação registrada no discovery |
| --- | --- | --- | --- |
| O app não atender à necessidade do público prioritário, ainda não definido. | Alta | Alto | Definir público e tarefas principais; validar o fluxo de busca e consulta com usuários antes de ampliar o escopo. |
| Usuários não encontrarem dados suficientes ou úteis na previsão diária. | Média | Alto | Campos do MVP estão definidos; validar utilidade da previsão diária com usuários antes de ampliar o produto. |
| Usuários selecionarem a localização errada quando há cidades com nomes iguais. | Média | Alto | Exibir cidade, região e país quando fornecidos e exigir seleção explícita; testar consultas ambíguas. |
| Usuários interpretarem a previsão básica como alerta ou orientação para situações de risco. | Média | Alto | Informar na interface que o app não fornece alertas severos e orientar a consulta a fontes oficiais para avisos. |
| Indisponibilidade ou lentidão da Open-Meteo impedir a consulta. | Média | Alto | Aplicar timeout de 10 s, informar falha e oferecer nova tentativa manual; cache não faz parte do MVP. |
| Limites de uso ou condições do provedor afetarem custo, disponibilidade ou forma de exibição dos dados. | Média | Alto | Confirmar condições de uso, limites e atribuição; monitorar consumo e definir uma estratégia de contingência. |
| Respostas parciais, inválidas ou alteradas causarem dados incorretos ou falhas na interface. | Média | Alto | Validar o formato das respostas, tratar campos ausentes sem inventar valores e testar cenários de erro. |
| Buscas rápidas ou concorrentes mostrarem resultados de uma cidade anterior. | Média | Médio | Descartar respostas obsoletas e testar buscas consecutivas, erros e novas tentativas. |
| Metas de performance não serem atingidas por variação de rede ou tempo de resposta externo. | Média | Alto | Definir ambiente de medição, acompanhar percentis e separar latência do app da latência do provedor. |
| Consultas de cidade serem enviadas ao provedor externo sem expectativa do usuário. | Baixa | Alto | Não coletar localização precisa nem persistir consultas; limitar o envio às chamadas necessárias à Open-Meteo e documentar essa transferência antes da publicação. |
| Barreiras de acessibilidade ou problemas em telas pequenas impedirem o uso. | Média | Alto | Validar WCAG 2.2 AA com teclado e tecnologias assistivas; testar a faixa de viewport definida em dispositivos reais. |
| A meta de disponibilidade não refletir a disponibilidade percebida, por excluir falhas do provedor. | Média | Médio | Medir separadamente frontend, rede e provedor; definir indicadores de degradação e monitoramento sintético. |
| Usuários esperarem acesso offline, embora o MVP dependa de rede. | Média | Médio | Exibir erro com retry manual quando a rede falhar; não apresentar dados antigos como atuais. |

# Out of Scope

- Contas, autenticação, backend próprio e persistência local ou remota de cidade, unidade, histórico ou preferências.
- Localização automática do dispositivo.
- Alertas meteorológicos severos e envio de notificações; o aviso informativo da limitação descrito em FR-16 está incluído.
- Aplicativos nativos, mapas, comparação simultânea de cidades, favoritos e histórico de consultas.
- Previsão horária ou período diferente dos cinco dias locais definidos em FR-05.
- Funcionamento offline, cache, exibição de dados antigos ou atualização em segundo plano.
- Provedor meteorológico alternativo, além da Open-Meteo definida para o MVP.
- Idiomas além de pt-BR e unidades além de Celsius/Fahrenheit para temperatura, km/h para vento e mm para precipitação.

# Open Questions

Não há perguntas em aberto que bloqueiem o desenvolvimento do MVP descrito nesta spec. Permanecem validações posteriores:

- Validar com usuários as personas, tarefas prioritárias e métricas de sucesso do produto; as personas atuais são hipóteses e isso não altera o contrato do MVP.
- Confirmar limites, termos de uso e atribuição da Open-Meteo antes da publicação; é um gate de release, não bloqueio de implementação.
- Definir hospedagem, monitoramento e eventual SLO antes de assumir compromisso de disponibilidade de produção; o MVP não inclui serviço próprio.

# Rastreabilidade

A tabela liga cada história aos critérios que verificam seu comportamento e aos requisitos não funcionais aplicáveis. Um requisito não funcional pode aparecer em mais de uma história; NFRs operacionais sem interação direta com uma história permanecem especificados em **Non-Functional Requirements**.

| User Story | Requisitos funcionais | Acceptance Criteria | Requisitos não funcionais relevantes |
| --- | --- | --- | --- |
| US-01 — Encontrar uma cidade | FR-01, FR-02, FR-03, FR-07, FR-12 | AC-01, AC-02, AC-03, AC-07, AC-12 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-10, NFR-11 |
| US-02 — Consultar o tempo | FR-04, FR-05, FR-14 | AC-04, AC-05, AC-14 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-10, NFR-11 |
| US-03 — Planejar atividades | FR-05, FR-14 | AC-05, AC-14 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-10, NFR-11 |
| US-04 — Usar a unidade familiar | FR-06 | AC-06 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-09, NFR-10 |
| US-05 — Acompanhar uma consulta | FR-08, FR-11, FR-13 | AC-08, AC-11, AC-13 | NFR-02, NFR-04, NFR-05, NFR-06, NFR-07, NFR-10 |
| US-06 — Começar uma consulta | FR-09 | AC-09 | NFR-02, NFR-03, NFR-04, NFR-10 |
| US-07 — Consultar outra cidade | FR-10, FR-15 | AC-10 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-11 |
| US-08 — Usar a interface em português | NFR-10 | AC-15 | NFR-02, NFR-10 |
| US-09 — Entender os limites dos dados | FR-16 | AC-16 | NFR-02, NFR-10 |

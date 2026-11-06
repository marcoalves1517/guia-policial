#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds the comprehensive 'Prontuário & Artigos Fundamentais OPC' (CP & CPP)
extracted directly from consolidated legislation for police patrolling officers.
"""
import json
import re

artigos = [
    # =========================================================================
    # 1. ATUAÇÃO POLICIAL & PODERES DO OPC (CPP)
    # =========================================================================
    {
        "id": "cpp-art-1",
        "code": "CPP",
        "article": "Artigo 1.º, alíneas c) e d)",
        "title": "Definição de Autoridade Judiciária e Órgão de Polícia Criminal (OPC)",
        "theme": "competencias",
        "theme_name": "Poderes & Competências OPC",
        "summary": "Distingue quem são as Autoridades Judiciárias e quem são os OPCs. O patrulheiro/militar/agente é OPC e atua sob a direção e dependência funcional da autoridade judiciária competente (Ministério Público na fase de inquérito).",
        "key_rules": [
            "Autoridade judiciária: O juiz, o juiz de instrução e o Ministério Público, cada um na fase processual respetiva.",
            "Órgãos de polícia criminal (OPC): Todas as entidades e agentes policiais a quem incumba levar a cabo quaisquer atos de inquérito ou medidas cautelares.",
            "Subordinação funcional: Os OPC realizam os atos de inquérito sob a direta orientação e dependência funcional do Ministério Público."
        ],
        "attention_opc": "Os OPCs não têm autonomia para arquivar processos nem para decidir sobre a aplicação de medidas de coação (exceto o TIR)."
    },
    {
        "id": "cpp-art-55",
        "code": "CPP",
        "article": "Artigo 55.º",
        "title": "Competência dos Órgãos de Polícia Criminal",
        "theme": "competencias",
        "theme_name": "Poderes & Competências OPC",
        "summary": "Fixa o campo de atuação do OPC. O OPC pode praticar os atos cautelares urgentes para assegurar os meios de prova (art. 249.º) e todos os atos que lhe forem delegados pelo Ministério Público.",
        "key_rules": [
            "Compete aos OPC coadjuvar as autoridades judiciárias na realização das finalidades do processo.",
            "Praticam os atos determinados pela autoridade judiciária e os atos cautelares necessários para impedir que desapareçam vestígios do crime.",
            "Recolhem de imediato a notícia do crime e procedem a averiguações sumárias para identificação de intervenientes."
        ],
        "attention_opc": "Mesmo antes de receber ordens do Ministério Público, o OPC tem o DEVER LEGAL de praticar atos cautelares urgentes."
    },
    {
        "id": "cpp-art-248",
        "code": "CPP",
        "article": "Artigo 248.º",
        "title": "Comunicação da Notícia do Crime pelo OPC",
        "theme": "competencias",
        "theme_name": "Poderes & Competências OPC",
        "summary": "Obriga o OPC a comunicar ao Ministério Público a notícia de todo e qualquer crime de que tome conhecimento.",
        "key_rules": [
            "Comunicação imediata se houver arguidos detidos em flagrante delito.",
            "Prazo geral: a notícia do crime deve ser remetida ao MP no mais curto prazo, que não pode exceder 10 dias (salvo normas de serviço interno de 15 dias para crimes sem arguido detido).",
            "A comunicação faz-se mediante Auto de Notícia (se presenciado pelo agente) ou Denúncia/Participação (se transmitido por terceiro)."
        ],
        "attention_opc": "Ocultar ou atrasar injustificadamente o envio de um auto de notícia ao MP pode gerar responsabilidade disciplinar e crime de prevaricação/denegação de justiça."
    },
    {
        "id": "cpp-art-249",
        "code": "CPP",
        "article": "Artigo 249.º",
        "title": "Providências Cautelares quanto aos Meios de Prova",
        "theme": "competencias",
        "theme_name": "Poderes & Competências OPC",
        "summary": "É a base legal do patrulheiro no local da ocorrência. Confere poder ao agente para praticar de imediato os atos necessários para evitar o extravio de provas antes da intervenção do MP.",
        "key_rules": [
            "O OPC deve praticar os atos cautelares necessários e urgentes para assegurar os meios de prova.",
            "Colher os elementos de prova que possam perder-se antes da intervenção da autoridade judiciária.",
            "Apreender cautelarmente objetos que possam servir de prova ou que tenham sido usados para o crime.",
            "Ouvir as pessoas que possam prestar esclarecimentos úteis (declarações informais no local)."
        ],
        "attention_opc": "A preservação do local e recolha célere de contactos de testemunhas presenciais no terreno é amparada diretamente por este artigo."
    },
    {
        "id": "cpp-art-250",
        "code": "CPP",
        "article": "Artigo 250.º",
        "title": "Identificação de Suspeitos e Pessoas Presentes (Prazo Máximo 6h)",
        "theme": "competencias",
        "theme_name": "Poderes & Competências OPC",
        "summary": "Regula a abordagem, pedido de identificação e a condução coerciva de cidadãos ao Posto/Esquadra caso recusem ou não consigam identificar-se. Fixa o limite rigoroso de 6 horas.",
        "key_rules": [
            "Quem pode ser identificado: Pessoas suspeitas de terem cometido ou planeado crimes, ou pessoas que se encontrem em locais onde se cometeram crimes ou locais vigiados.",
            "Meios válidos de identificação: Cartão de Cidadão, Bilhete de Identidade, Passaporte, Carta de Condução ou qualquer documento oficial autêntico com fotografia, ou testemunho de pessoa idónea devidamente identificada.",
            "Condução ao Posto/Esquadra: Se não for possível identificar no local, o OPC pode conduzir o indivíduo à subunidade policial mais próxima e obrigá-lo a permanecer pelo tempo estritamente necessário.",
            "PRAZO MÁXIMO LEGAL DE 6 HORAS: A retenção para identificação NUNCA pode exceder seis horas! Ultrapassadas as 6 horas, o cidadão tem de ser libertado de imediato sob pena de sequestro ilegal.",
            "Direito de comunicação: A pessoa conduzida tem o direito de avisar um familiar ou pessoa da sua confiança sobre a sua retenção.",
            "Auto de Identificação: Deve ser sempre lavrado auto das diligências e tempo de retenção."
        ],
        "attention_opc": "NUNCA ultrapassar o limite de 6 horas. Se ao fim de 6 horas a identidade não for confirmada e não houver flagrante delito nem mandado de captura pendente, a pessoa tem obrigatoriamente de ser restituída à liberdade."
    },
    {
        "id": "cpp-art-251",
        "code": "CPP",
        "article": "Artigo 251.º",
        "title": "Revistas e Buscas de Segurança Cautelares sem Mandado",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Permite aos OPC proceder a revista sumária e busca de segurança no terreno sem mandado do juiz, para desarmar pessoas suspeitas e acautelar o perigo imediato.",
        "key_rules": [
            "Fundada suspeita de que a pessoa oculta armas, munições, instrumentos de agressão ou objetos perigosos.",
            "Pessoas suspeitas que se encontrem em vias públicas, locais de diversão noturna ou recintos desportivos.",
            "Em situações de flagrante delito para apreensão de objetos subtraídos ou utilizados no crime.",
            "A revista é sumária (apalpamento do vestuário e bagagens de mão) visando garantir a segurança dos agentes e de terceiros."
        ],
        "attention_opc": "A revista de segurança do art. 251.º visa ARMAS e OBJETOS PERIGOSOS para a segurança. Revistas minuciosas corporais (despir) requerem despacho judicial salvo flagrante delito."
    },

    # =========================================================================
    # 2. DETENÇÃO EM FLAGRANTE DELITO & PRAZOS (CPP)
    # =========================================================================
    {
        "id": "cpp-art-254",
        "code": "CPP",
        "article": "Artigo 254.º",
        "title": "Finalidades da Detenção",
        "theme": "detencao",
        "theme_name": "Detenção & Flagrante",
        "summary": "Define as únicas finalidades legítimas para privar alguém da liberdade mediante detenção.",
        "key_rules": [
            "Apresentar o detido no prazo máximo de 48 horas a primeiro interrogatório judicial para aplicação de medida de coação ou validação.",
            "Apresentar o detido a julgamento em processo sumário.",
            "Assegurar a presença do detido em ato processual que exija a sua comparência perante a autoridade judiciária."
        ],
        "attention_opc": "A detenção é uma medida de natureza meramente precária e instrumental. Não pode servir como 'punição' nem durar além do necessário."
    },
    {
        "id": "cpp-art-255",
        "code": "CPP",
        "article": "Artigo 255.º",
        "title": "Detenção em Flagrante Delito (Obrigatoriedade do OPC)",
        "theme": "detencao",
        "theme_name": "Detenção & Flagrante",
        "summary": "Regula quem tem o dever e quem tem a faculdade de deter em flagrante delito. O agente de polícia É OBRIGADO a deter nos crimes puníveis com prisão.",
        "key_rules": [
            "Obrigação do OPC: As autoridades judiciárias e as entidades policiais DEVEM proceder à detenção em caso de flagrante delito por crime punível com pena de prisão.",
            "Faculdade dos cidadãos: Qualquer pessoa PODE deter se não estiver presente nem puder ser chamada em tempo útil autoridade policial (devendo entregar o detido de imediato à polícia).",
            "Crimes Semipúblicos: A detenção só se mantém se o titular do direito de queixa a formular oralmente ou por escrito no ato da detenção perante o OPC.",
            "Crimes Particulares: Apenas admissível se houver queixa e o ofendido declarar que pretende acusação."
        ],
        "attention_opc": "Em crime semipúblico (ex: furto simples, dano, ofensas simples), se a vítima declarar expressamente no local que NÃO deseja queixa-crime, o OPC NÃO pode manter a detenção!"
    },
    {
        "id": "cpp-art-256",
        "code": "CPP",
        "article": "Artigo 256.º",
        "title": "Conceito de Flagrante Delito e Quase-Flagrante",
        "theme": "detencao",
        "theme_name": "Detenção & Flagrante",
        "summary": "Define com precisão cirúrgica o que é flagrante delito e as suas três modalidades.",
        "key_rules": [
            "1. Flagrante Atual: O crime está a ser cometido no momento presente.",
            "2. Quase-Flagrante: O crime acaba de ser cometido e o agente é perseguido por qualquer pessoa logo a seguir.",
            "3. Flagrante por Presunção/Objetos: O indivíduo é encontrado logo após o crime com objetos, armas ou sinais que mostrem inequivocamente que acabou de o cometer ou nele participou.",
            "Crime permanente (ex: sequestro, detenção de arma proibida, posse de droga para tráfico): O flagrante delito perdura enquanto durar a consumação do ilícito."
        ],
        "attention_opc": "Se decorreram várias horas ou dias sem perseguição contínua, cessa o flagrante delito e a detenção só pode ocorrer com MANDADO judicial ou do MP."
    },
    {
        "id": "cpp-art-257",
        "code": "CPP",
        "article": "Artigo 257.º",
        "title": "Detenção Fora de Flagrante Delito",
        "theme": "detencao",
        "theme_name": "Detenção & Flagrante",
        "summary": "Regula a detenção quando NÃO há flagrante. Em regra só o Juiz ou MP podem emitir mandado. O OPC só tem poderes excecionais e restritos por sua iniciativa.",
        "key_rules": [
            "Regra geral: Exige mandado de detenção emitido pelo Juiz ou pelo Ministério Público.",
            "Exceção do OPC por iniciativa própria: O OPC só pode deter fora de flagrante por iniciativa própria se cumulativamente: 1) Tratar-se de crime doloso punível com prisão > 3 anos; 2) Houver perigo fundado de fuga; 3) Não for possível recorrer em tempo útil à autoridade judiciária.",
            "Crimes especiais autorizados: Terrorismo, criminalidade violenta ou altamente organizada, sequestro, roubo, extorsão, tráfico de armas ou estupefacientes.",
            "Dever de validação: O detido tem de ser apresentado de imediato ao Ministério Público para validação da detenção."
        ],
        "attention_opc": "Detenções fora de flagrante sem mandado em crimes comuns simples (ex: furto simples) são ilegais e constituem crime de abuso de poder."
    },
    {
        "id": "cpp-art-261",
        "code": "CPP",
        "article": "Artigo 261.º",
        "title": "Prazo Máximo de Apresentação de Detido ao Juiz (48 Horas)",
        "theme": "detencao",
        "theme_name": "Detenção & Flagrante",
        "summary": "Fixa o limite constitucional inultrapassável de 48 horas para apresentação de arguido detido perante a autoridade judicial.",
        "key_rules": [
            "O detido em flagrante delito ou fora de flagrante deve ser apresentado ao Ministério Público no mais curto prazo, e nunca depois de decorridas 48 horas.",
            "O prazo conta-se minuto a minuto a partir do momento exato em que a voz de detenção foi comunicada ao suspeito.",
            "Se o prazo de 48 horas for ultrapassado sem o detido ter sido presente a juiz, a detenção torna-se ILEGAL e dá lugar a pedido imediato de Habeas Corpus com libertação obrigatória."
        ],
        "attention_opc": "Registar sempre no Auto de Notícia a hora exata da detenção (ex: 14h25). É essa hora que fixa o início da contagem das 48 horas."
    },

    # =========================================================================
    # 3. ESTATUTO DO ARGUIDO E TIR (CPP)
    # =========================================================================
    {
        "id": "cpp-art-58",
        "code": "CPP",
        "article": "Artigo 58.º",
        "title": "Constituição Obrigatória de Arguido",
        "theme": "arguido",
        "theme_name": "Arguido & TIR",
        "summary": "Fixa os momentos em que o patrulheiro/OPC é OBRIGADO a constituir alguém como arguido e as formalidades que não podem falhar.",
        "key_rules": [
            "Quando é OBRIGATÓRIO constituir arguido: 1) Quando alguém for detido; 2) Logo que corra inquérito contra pessoa determinada e sobre ela recaia fundada suspeita; 3) Sempre que uma testemunha/declarante preste declarações das quais resulte a suspeita da sua própria culpabilidade (deve suspender-se a inquirição e constituir arguido de imediato!).",
            "Formalidades obrigatórias: Entrega do documento de constituição de arguido com a notificação escrita e detalhada de todos os seus direitos e deveres (art. 61.º).",
            "Nulidade: Depoimentos prestados por quem devia ter sido constituído arguido NÃO podem ser usados como prova contra a própria pessoa (proibição de prova!)."
        ],
        "attention_opc": "Se durante a conversa uma testemunha confessar que participou no crime, PARE A INQUIRIÇÃO NO MOMENTO! Não continue como testemunha. Constitua arguido e notifique os direitos ao silêncio."
    },
    {
        "id": "cpp-art-61",
        "code": "CPP",
        "article": "Artigo 61.º",
        "title": "Direitos e Deveres Processuais do Arguido",
        "theme": "arguido",
        "theme_name": "Arguido & TIR",
        "summary": "O núcleo de garantias de defesa do cidadão sujeito a processo criminal.",
        "key_rules": [
            "Direito de estar presente nos atos processuais que lhe digam respeito.",
            "Direito a ser assistido por defensor/advogado (constituído ou nomeado oficioso) e a comunicar privadamente com ele antes do interrogatório.",
            "DIREITO AO SILÊNCIO: Não responder a perguntas sobre os factos que lhe são imputados, nem sobre o conteúdo das suas declarações, sem que o silêncio o possa desfavorecer.",
            "Direito a não se autoincriminar (princípio nemo tenetur se ipsum accusare).",
            "DEVERES DO ARGUIDO: 1) Responder com verdade às perguntas sobre a sua IDENTIDADE civil; 2) Sujeitar-se a medidas de coação; 3) Comparecer a todas as notificações legais."
        ],
        "attention_opc": "O arguido PODE mentir ou calar-se sobre o crime, mas É OBRIGADO a dizer a verdade sobre a sua identidade e morada! Fornecer identidade falsa é CRIME (art. 359.º CP)."
    },
    {
        "id": "cpp-art-196",
        "code": "CPP",
        "article": "Artigo 196.º",
        "title": "Termo de Identidade e Residência (TIR)",
        "theme": "arguido",
        "theme_name": "Arguido & TIR",
        "summary": "A medida de coação mínima e obrigatória para todo e qualquer arguido. É a única medida que o OPC tem competência legal para aplicar sem despacho prévio do juiz.",
        "key_rules": [
            "Aplicação obrigatória a qualquer pessoa constituída como arguido, mesmo que não seja detida.",
            "Obrigações expressas do arguido no TIR: 1) Comparecer perante a autoridade sempre que notificado; 2) Não mudar de residência nem dela se ausentar por mais de 5 dias sem comunicar a nova residência ou o lugar onde possa ser encontrado; 3) Indicar morada certa para notificações postais.",
            "Presunção de notificação: As notificações enviadas por via postal simples com prova de depósito para a morada constante do TIR consideram-se feitas!",
            "Validade do TIR: Mantém-se válido até à extinção da pena ou ao arquivamento definitivo do processo."
        ],
        "attention_opc": "Exigir documento comprovativo da morada ou certificar-se de que a morada no TIR é real e completa (rua, número, andar, código postal). Uma morada incorreta impede o julgamento do arguido."
    },

    # =========================================================================
    # 4. REVISTAS, BUSCAS E APREENSÕES (CPP)
    # =========================================================================
    {
        "id": "cpp-art-174",
        "code": "CPP",
        "article": "Artigo 174.º",
        "title": "Pressupostos Gerais das Revistas e Buscas",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Estipula as condições legais para revistar o corpo ou buscar em locais e veículos.",
        "key_rules": [
            "Revista pessoal: Quando houver indícios de que alguém oculta na sua pessoa quaisquer objetos relacionados com um crime ou que possam servir de prova.",
            "Busca: Quando houver indícios de que os objetos se encontram em lugar reservado ou não livremente acessível ao público.",
            "Em regra, as revistas e buscas são ordenadas por despacho da autoridade judiciária (Juiz ou MP).",
            "Exceção: O OPC pode agir sem despacho em casos de flagrante delito, perigo na demora ou consentimento expresso das pessoas visadas."
        ],
        "attention_opc": "A busca a veículo na via pública em fiscalização de rotina não pode transformar-se em devassa arbitrária sem que existam indícios objetivos de ilícito."
    },
    {
        "id": "cpp-art-175",
        "code": "CPP",
        "article": "Artigo 175.º",
        "title": "Formalidades da Revista Pessoal",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Regras de respeito pela dignidade humana na execução da revista pessoal.",
        "key_rules": [
            "Antes de iniciar a revista, o OPC deve avisar o suspeito do motivo da diligência e convidá-lo a entregar voluntariamente os objetos procurados.",
            "A revista deve respeitar a dignidade e, tanto quanto possível, o pudor do revistado.",
            "A revista íntima ou que envolva despir a pessoa deve ser efetuada em local reservado e OBRIGATORIAMENTE por pessoa do mesmo sexo que o revistado."
        ],
        "attention_opc": "Revistas corporais femininas devem ser executadas por militares/agentes femininas. Caso não estejam presentes, conduzir à subunidade onde haja elemento feminino."
    },
    {
        "id": "cpp-art-177",
        "code": "CPP",
        "article": "Artigo 177.º",
        "title": "Busca Domiciliária e Restrições Noturnas",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Proteção constitucional do domicílio. Define quando e a que horas a polícia pode entrar numa residência.",
        "key_rules": [
            "Horário geral da busca domiciliária: Só pode realizar-se entre as 07h00 e as 21h00, sob pena de nulidade insanável.",
            "Busca noturna (entre as 21h00 e as 07h00): Só é permitida nos casos de terrorismo ou criminalidade especialmente violenta/organizada, ou mediante consentimento documentado do morador.",
            "QUANDO O OPC PODE ENTRAR NO DOMICÍLIO SEM MANDADO DO JUIZ: 1) Em situação de flagrante delito por crime a que corresponda pena de prisão superior a 3 anos; 2) Em caso de emergência com perigo iminente para a vida ou integridade física grave de qualquer pessoa (ex: gritos de socorro, fogo, violência doméstica extrema); 3) Com o consentimento expresso e escrito do titular da habitação.",
            "Comunicação posterior: A busca domiciliária efetuada sem mandado tem de ser comunicada imediatamente ao Juiz de Instrução para validação, sob pena de nulidade das provas apreendidas."
        ],
        "attention_opc": "NUNCA entrar num domicílio sem mandado para investigar furtos simples ou contraordenações de ruído. A violação de domicílio sem os estritos requisitos do art. 177.º é crime praticado pelo agente!"
    },
    {
        "id": "cpp-art-178",
        "code": "CPP",
        "article": "Artigo 178.º",
        "title": "Objeto e Pressupostos da Apreensão",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Regula a apreensão de todos os bens, documentos e objetos conexos com infrações criminais.",
        "key_rules": [
            "São apreendidos os objetos que tiverem servido ou estivessem destinados a servir a prática de um crime, os que constituírem o seu produto, lucro, preço ou recompensa, e bem assim todos os que tiverem sido deixados pelo agente no local do crime.",
            "O OPC procede à apreensão no decurso de revistas ou buscas ou quando haja perigo na demora.",
            "Auto de Apreensão: Deve descrever minuciosamente cada objeto apreendido (marca, modelo, número de série, cor, estado de conservação, valor estimado).",
            "Validação: As apreensões efetuadas por OPC estão sujeitas a validação pela autoridade judiciária competente (MP)."
        ],
        "attention_opc": "Acondicionar sempre os objetos apreendidos em envelopes ou sacos selados com registo da cadeia de custódia para garantir a sua validade como prova pericial."
    },
    {
        "id": "cpp-art-186",
        "code": "CPP",
        "article": "Artigo 186.º",
        "title": "Apreensão e Interceção de Correspondência",
        "theme": "revistas",
        "theme_name": "Revistas & Buscas",
        "summary": "Regime restritivo de correspondência postal ou eletrónica fechada.",
        "key_rules": [
            "A autorização e a abertura de correspondência postal fechada é de competência EXCLUSIVA do Juiz de Instrução.",
            "O OPC que encontre cartas, encomendas postais ou mensagens fechadas pode retê-las cautelarmente se suspeitar de conterem droga, armas ou provas, mas NÃO AS PODE ABRIR!",
            "A correspondência deve ser apresentada intacta e selada ao Juiz no mais curto prazo."
        ],
        "attention_opc": "O OPC que rasgue ou abra uma carta ou envelope postal fechado comete crime de violação de correspondência e anula irremediavelmente a prova obtida."
    },

    # =========================================================================
    # 5. DIREITOS E PROTEÇÃO DA VÍTIMA (CPP & ESTATUTO)
    # =========================================================================
    {
        "id": "cpp-art-67-a",
        "code": "CPP",
        "article": "Artigo 67.º-A e seguintes",
        "theme": "vitima",
        "theme_name": "Estatuto da Vítima",
        "title": "Estatuto da Vítima e Vítimas Especialmente Vulneráveis",
        "summary": "Direitos fundamentais de acolhimento, proteção, informação e apoio médico/psicológico a quem sofre com o crime.",
        "key_rules": [
            "Definição de vítima: A pessoa singular que sofreu um dano patrimonial, físico ou moral diretamente decorrente de um crime.",
            "Dever de informação do OPC: Desde o primeiro contacto, o OPC DEVE entregar à vítima cópia do folheto de direitos e prestar informação clara sobre: 1) Assistência médica e psicológica (APAV); 2) Casas de abrigo e apoio social; 3) Indemnização e apoio judiciário; 4) Mecanismos de proteção policial.",
            "Vítimas especialmente vulneráveis: Crianças, pessoas idosas, pessoas com deficiência, vítimas de violência doméstica, mutilação genital feminina ou crimes sexuais.",
            "Medidas de proteção: Proibição de acareações forçadas com o agressor; direito a ser inquirida em ambiente reservado e por agente com formação adequada."
        ],
        "attention_opc": "A Ficha de Notificação dos Direitos da Vítima é documento OBRIGATÓRIO no processo. A sua omissão constitui falta processual grave."
    },
    {
        "id": "cpp-art-271",
        "code": "CPP",
        "article": "Artigo 271.º",
        "theme": "vitima",
        "theme_name": "Estatuto da Vítima",
        "title": "Declarações para Memória Futura",
        "summary": "Mecanismo judicial para evitar que crianças e vítimas vulneráveis tenham de reviver o trauma ao depor repetidamente em julgamento.",
        "key_rules": [
            "Aplica-se em crimes contra a liberdade e autodeterminação sexual, tráfico de pessoas, crimes contra a integridade física de menores e violência doméstica.",
            "As declarações são prestadas no inquérito perante o Juiz de Instrução e o MP, com assistência de psicólogo ou técnico especializado.",
            "O depoimento é gravado em vídeo e áudio para ser reproduzido diretamente no julgamento sem necessidade de presença física da vítima na sala de audiências."
        ],
        "attention_opc": "O patrulheiro NUNCA deve fazer interrogatórios exaustivos a crianças vítimas de abuso. Recolha apenas o estritamente urgente e solicite de imediato a intervenção do MP/PJ."
    },

    # =========================================================================
    # 6. CAUSAS DE EXCLUSÃO E LEGÍTIMA DEFESA (CP)
    # =========================================================================
    {
        "id": "cp-art-31",
        "code": "CP",
        "article": "Artigo 31.º",
        "theme": "legitima_defesa",
        "theme_name": "Legítima Defesa & Causas de Exclusão",
        "title": "Causas de Justificação do Facto",
        "summary": "Determina quando uma ação que normalmente seria crime deixa de ser ilícita perante a ordem jurídica.",
        "key_rules": [
            "O facto não é punível quando a sua ilicitude for excluída pela ordem jurídica considerada na sua totalidade.",
            "Causas principais de justificação: 1) Legítima defesa (art. 32.º); 2) Direito de necessidade (art. 34.º); 3) Cumprimento de um dever imposto por lei ou de ordem legítima da autoridade (art. 36.º); 4) Consentimento do ofendido (art. 38.º)."
        ],
        "attention_opc": "O uso proporcional da força física por um agente de polícia para imobilizar um criminoso ampara-se no cumprimento de um dever legal (art. 31.º n.º 2 al. b) CP)."
    },
    {
        "id": "cp-art-32",
        "code": "CP",
        "article": "Artigo 32.º",
        "theme": "legitima_defesa",
        "theme_name": "Legítima Defesa & Causas de Exclusão",
        "title": "Legítima Defesa (Os 4 Requisitos Cumulativos)",
        "summary": "A pedra angular da autodefesa e uso legítimo da força pelo agente policial e pelos cidadãos.",
        "key_rules": [
            "Definição: É legítima a defesa que constitui o meio necessário para repelir uma agressão.",
            "OS 4 REQUISITOS CUMULATIVOS: 1) AGRESSÃO ATUAL OU IMINENTE: Agressão que já se iniciou ou está prestes a eclodir (não se admite legítima defesa contra ataques do passado nem contra ameaças hipotéticas do futuro); 2) ILÍCITA: O agressor não tem direito de agredir; 3) DEFESA DE DIREITOS PRÓPRIOS OU ALHEIOS: Proteção da vida, integridade física, liberdade ou património seu ou de um terceiro; 4) NECESSIDADE E PROPORCIONALIDADE DO MEIO: Utilizar o meio menos gravoso ao dispor que seja eficaz para travar o ataque.",
            "Excesso de legítima defesa (art. 33.º CP): O excesso por medo, susto ou perturbação não culposa não é punível."
        ],
        "attention_opc": "Disparar contra alguém que foge de costas sem ameaçar a vida de ninguém NÃO É legítima defesa! O uso de arma de fogo policial exige perigo iminente de morte ou ferimento grave."
    },
    {
        "id": "cp-art-34",
        "code": "CP",
        "article": "Artigo 34.º",
        "theme": "legitima_defesa",
        "theme_name": "Legítima Defesa & Causas de Exclusão",
        "title": "Direito de Necessidade",
        "summary": "Permite sacrificar um bem alheio para salvar outro bem juridicamente superior perante perigo atual.",
        "key_rules": [
            "Não é ilícito o facto praticado como meio adequado para afastar um perigo atual, e não voluntariamente provocado, que ameace interesses juridicamente protegidos do agente ou de terceiro.",
            "Requisito chave: O perigo não pode ter sido criado dolosamente pelo próprio agente.",
            "Proporcionalidade: O interesse que se salvaguarda tem de ser manifestamente superior ao interesse sacrificado (ex: partir a porta ou vidro de um carro para salvar um bebé fechado ao sol no verão)."
        ],
        "attention_opc": "Danos patrimoniais provocados por polícias para salvar vidas em socorro imediato encontram total cobertura jurídica neste artigo."
    },
    {
        "id": "cp-art-19",
        "code": "CP",
        "article": "Artigo 19.º",
        "theme": "legitima_defesa",
        "theme_name": "Legítima Defesa & Causas de Exclusão",
        "title": "Inimputabilidade em Razão da Idade (Menores de 16 Anos)",
        "summary": "Fixa o limiar etário da responsabilidade criminal em Portugal.",
        "key_rules": [
            "Os menores de 16 anos são penalmente INIMPUTÁVEIS. Não cometem 'crimes' nem podem ser condenados pelo Código Penal.",
            "Regime aplicável: Factos praticados por jovens entre os 12 e os 16 anos estão sujeitos à Lei Tutelar Educativa (Lei 166/99) e competência do Tribunal de Família e Menores.",
            "Menores de 12 anos: Aplica-se exclusivamente a Lei de Proteção de Crianças e Jovens em Perigo (LPCJP - Lei 147/99) e intervenção da CPCJ.",
            "Condução policial: O jovem com menos de 16 anos apanhado em flagrante de ato qualificado como crime pode ser retido cautelarmente pelo OPC para entrega aos pais/tutores ou apresentação ao MP de Família e Menores."
        ],
        "attention_opc": "NUNCA constituir arguido pelo Código de Processo Penal um jovem com menos de 16 anos! Não se aplica TIR do art. 196.º CPP nem cadeia comum."
    },

    # =========================================================================
    # 7. DIREITO DE QUEIXA, DESISTÊNCIA E PRAZOS (CP)
    # =========================================================================
    {
        "id": "cp-art-113",
        "code": "CP",
        "article": "Artigo 113.º",
        "theme": "queixa",
        "theme_name": "Direito de Queixa & Prazos",
        "title": "Titulares do Direito de Queixa",
        "summary": "Determina quem tem legitimidade legal para formalizar queixa nos crimes semipúblicos e particulares.",
        "key_rules": [
            "Regra geral: O titular do direito de queixa é o OFENDIDO (titular dos interesses que a lei quis proteger com a incriminação).",
            "Morte da vítima: Se a vítima falecer sem ter renunciado nem apresentado queixa, o direito cabe ao cônjuge sobrevivo, descendentes e adotados, ascendentes e irmãos.",
            "Menores de 16 anos ou incapazes: O direito de queixa cabe aos respetivos representantes legais (pais ou tutores).",
            "Interesse do menor: Se houver conflito de interesses entre o menor e os pais (ou estes não apresentarem queixa por negligência), o Ministério Público pode exercer o direito de queixa em representação da criança."
        ],
        "attention_opc": "Vizinhos, amigos ou meras testemunhas NÃO têm legitimidade para apresentar queixa por crimes semipúblicos. A queixa tem de provir da vítima direta ou do seu representante."
    },
    {
        "id": "cp-art-115",
        "code": "CP",
        "article": "Artigo 115.º",
        "theme": "queixa",
        "theme_name": "Direito de Queixa & Prazos",
        "title": "Extinção do Direito de Queixa por Caducidade (Prazo de 6 Meses)",
        "summary": "Fixa o prazo fatal de 6 meses para queixa nos crimes semipúblicos.",
        "key_rules": [
            "O direito de queixa extingue-se no prazo de 6 MESES.",
            "Início da contagem do prazo: O prazo de 6 meses começa a contar no dia em que o titular teve conhecimento do facto e dos seus autores (e não necessariamente da data em que o crime ocorreu!).",
            "Natureza do prazo: É um prazo de caducidade material. Não se suspende em férias judiciais.",
            "Decorrido o prazo de 6 meses sem queixa: Extingue-se definitivamente o procedimento criminal. O Ministério Público arquiva obrigatoriamente os autos."
        ],
        "attention_opc": "Perguntar sempre e registar no auto a data em que a vítima descobriu quem foi o autor do crime, para aferir se os 6 meses foram cumpridos."
    },
    {
        "id": "cp-art-116",
        "code": "CP",
        "article": "Artigo 116.º",
        "theme": "queixa",
        "theme_name": "Direito de Queixa & Prazos",
        "title": "Renúncia e Desistência da Queixa",
        "summary": "Regula a manifestação formal da vítima de que não pretende procedimento criminal.",
        "key_rules": [
            "Renúncia: A vítima pode renunciar ao direito de queixa antes de o exercer. A renúncia expressa extingue logo o direito de queixa.",
            "Desistência: O queixoso pode desistir da queixa já apresentada em qualquer momento do processo até à publicação da sentença em 1.ª instância.",
            "Oposição do arguido: A desistência da queixa depende de não haver oposição do arguido (salvo se a desistência ocorrer antes da notificação do arguido).",
            "Efeitos: A desistência extingue o processo relativamente aos crimes semipúblicos."
        ],
        "attention_opc": "A renúncia ou desistência de queixa só tem valor em crimes SEMIPÚBLICOS ou PARTICULARES. Em crimes públicos (violência doméstica, roubo, condução sob álcool), a desistência é juridicamente INVÁLIDA e o processo segue em frente!"
    },
    {
        "id": "cp-art-202",
        "code": "CP",
        "article": "Artigo 202.º",
        "theme": "queixa",
        "theme_name": "Direito de Queixa & Prazos",
        "title": "Definições Legais de Valor (UC - Unidade de Conta)",
        "summary": "Define as fronteiras monetárias para qualificação dos crimes contra o património (furtos, danos, burlas).",
        "key_rules": [
            "Valor diminuto: Aquele que não exceder 1 UC (Unidade de Conta processual = 102,00 €).",
            "Valor elevado: Aquele que exceder 50 UC (5.100,00 €). Transforma automaticamente vários crimes semipúblicos em crimes públicos ou qualificados!",
            "Valor consideravelmente elevado: Aquele que exceder 200 UC (20.400,00 €). Qualificação de gravidade máxima."
        ],
        "attention_opc": "No furto e burla, apurar com faturas o valor exato dos bens subtraídos. Se passar de 50 UC (5.100€), passa a furto/burla qualificada com tramitação pública."
    },

    # =========================================================================
    # 8. CRIMES CONTRA A AUTORIDADE PÚBLICA & INJÚRIAS (CP)
    # =========================================================================
    {
        "id": "cp-art-181-184",
        "code": "CP",
        "article": "Artigos 181.º c/c 184.º",
        "theme": "autoridade",
        "theme_name": "Crimes Contra a Autoridade",
        "title": "Injúria e Difamação Agravada contra Agente da Autoridade",
        "summary": "Proteção penal dos agentes policiais e militares contra ofensas verbais ou gestuais no exercício das funções.",
        "key_rules": [
            "Injúria simples (art. 181.º): Quem injuriar outra pessoa, imputando-lhe factos ou dirigindo-lhe palavras ofensivas da sua honra e consideração.",
            "Agravação por ser autoridade (art. 184.º): Se a ofensa for cometida contra membro de órgão de soberania, magistrado, funcionário público ou agente da força pública no exercício das suas funções ou por causa delas, os limites mínimo e máximo das penas são AGRAVADOS EM METADE.",
            "Natureza: Trata-se de crime SEMIPÚBLICO. Carece de queixa do militar/agente ofendido."
        ],
        "attention_opc": "O agente ofendido verbalmente deve fazer constar expressamente no auto as palavras exatas proferidas e formular formalmente o desejo de procedimento criminal."
    },
    {
        "id": "cp-art-347",
        "code": "CP",
        "article": "Artigo 347.º",
        "theme": "autoridade",
        "theme_name": "Crimes Contra a Autoridade",
        "title": "Resistência e Coação sobre Funcionário (Requisitos Rígidos)",
        "summary": "Um dos artigos mais importantes e com maior taxa de erro de enquadramento policial no terreno.",
        "key_rules": [
            "Conceito legal: Empregar VIOLÊNCIA FÍSICA ou AMEAÇA GRAVE contra funcionário ou membro das Forças Armadas / Segurança para o impedir de praticar ato legítimo de serviço, ou para o constranger a praticar ato contrário aos deveres do cargo.",
            "DISTINÇÃO CRUCIAL NO TERRENO: 1) Meras discussões acaloradas, refilices verbais ou puxar o braço sem agressão NÃO constituem Resistência do art. 347.º; 2) É ABSOLUTAMENTE EXIGIDA a utilização de violência física efetiva (murros, pontapés, empurrões violentos com queda) ou ameaça grave de morte/ferimento com arma.",
            "Crime público de ação oficiosa e detenção obrigatória em flagrante delito."
        ],
        "attention_opc": "Descrever no Auto de Notícia os atos concretos de violência física: 'o suspeito desferiu dois socos no peito do militar...' e não apenas fórmulas genéricas como 'resistiu à atuação policial'."
    },
    {
        "id": "cp-art-348",
        "code": "CP",
        "article": "Artigo 348.º",
        "theme": "autoridade",
        "theme_name": "Crimes Contra a Autoridade",
        "title": "Crime de Desobediência (A Cominação Obrigatória da Alínea b)",
        "summary": "A chave para a legalidade da detenção por desobediência simples no terreno.",
        "key_rules": [
            "Alínea a): Quando a própria lei prevê expressamente a punição por desobediência (ex: recusa de teste de álcool no Código da Estrada).",
            "Alínea b): Quando o OPC dá uma ordem legítima fundamentada e FAZ A ADVERTÊNCIA FORMAL (COMINAÇÃO) de que o não acatamento faz incorrer no crime de desobediência.",
            "FÓRMULA OBRIGATÓRIA A PROFERIR NO TERRENO: 'Em nome da lei, ordeno-lhe que [ação concreta]. Fica advertido de que, se não cumprir esta ordem legítima, incorre no crime de Desobediência previsto no artigo 348.º do Código Penal!'",
            "Sem a menção expressa de que a falta de cumprimento constitui crime de desobediência, a conduta NÃO é punível penalmente pelo tribunal!"
        ],
        "attention_opc": "Registar no Auto de Notícia a frase literal da cominação legal que o militar/agente proferiu ao cidadão antes de efetuar a detenção."
    },
    {
        "id": "cp-art-358",
        "code": "CP",
        "article": "Artigo 358.º",
        "theme": "autoridade",
        "theme_name": "Crimes Contra a Autoridade",
        "title": "Usurpação de Funções",
        "summary": "Para cidadãos que fingem ser polícias, militares ou funcionários públicos.",
        "key_rules": [
            "Quem, sem para tal estar autorizado, exercer funções ou praticar atos próprios de funcionário público, de comando militar ou de força de segurança.",
            "Comum no terreno: Indivíduos com luzes azuis pirilampo nas viaturas civis a mandar parar condutores na estrada, ou com falsos distintivos/coletes policiais a abordar idosos em burlas.",
            "Crime público com apreensão de todos os artefactos e distintivos."
        ],
        "attention_opc": "Apreender os falsos distintivos, coletes, sirenes, porta-chaves com insígnias e fardamentos montados."
    },
    {
        "id": "cp-art-359-360",
        "code": "CP",
        "article": "Artigos 359.º e 360.º",
        "theme": "autoridade",
        "theme_name": "Crimes Contra a Autoridade",
        "title": "Falsas Declarações perante Autoridade Pública",
        "summary": "Punição criminal para quem mente sobre a sua identidade perante o OPC.",
        "key_rules": [
            "Quem prestar depoimento ou declaração falsa perante autoridade pública com competência para a receber.",
            "Aplica-se ao indivíduo que, sendo abordado pelo OPC, fornece intencionalmente dados de identificação falsos ou o nome de um irmão/amigo para ocultar mandado de captura.",
            "Deter em flagrante e submeter a identificação lofoscópica (impressões digitais)."
        ],
        "attention_opc": "O arguido pode calar-se quanto aos factos do crime, mas se der um nome falso para o Termo de Identidade e Residência (TIR) comete crime autónomo do art. 359.º CP."
    }
]

output_path = "/home/marco/Transferências/Antigravity/guia-policial-app/artigos_opc.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(artigos, f, ensure_ascii=False, indent=2)

print(f"Sucesso! Gerados {len(artigos)} artigos fundamentais OPC em {output_path}")

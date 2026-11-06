#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate the complete Portuguese Police Expediente (SOP) database
for GNR / PSP field operations.
"""
import json
import os

data = [
    # -------------------------------------------------------------
    # 1. PATRIMÓNIO
    # -------------------------------------------------------------
    {
        "id": "furto-simples",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Furto Simples",
        "article": "Artigo 203.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa da vítima/proprietário no prazo de 6 meses (art. 115.º CP). Sem queixa expressa, o OPC não pode prosseguir criminalmente.",
        "detention": "Em flagrante delito: detenção obrigatória pelo OPC se a vítima manifestar de imediato o desejo de procedimento criminal (queixa no local) ou para identificação se não tiver idoneidade.",
        "steps": [
            "Garantir a segurança no local e cessar a infração.",
            "Identificar com rigor o suspeito (art. 250.º CPP) e o ofendido/testemunhas.",
            "Questionar formalmente o ofendido se deseja exercer o direito de queixa criminal.",
            "Realizar revista de segurança/apreensão dos objetos furtados na posse do suspeito (art. 174.º e 178.º CPP).",
            "Recolher elementos descritivos dos bens: marcas, modelos, números de série, faturas, fotografias.",
            "Se detido em flagrante e houver queixa: conduzir ao Posto/Esquadra para constituição de arguido e TIR.",
            "Se o suspeito fugiu: recolher imagens de videovigilância (CCTV) e características físicas e de vestuário."
        ],
        "expediente_docs": [
            "Auto de Notícia (se presenciado/flagrante) ou Auto de Denúncia / Participação",
            "Auto de Declarações do Ofendido com manifestação expressa de queixa",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Auto de Apreensão (art. 178.º CPP) e Auto de Depósito / Restituição provisória ao legítimo dono",
            "Notificação do Estatuto e Direitos da Vítima (art. 67.º-A CPP)",
            "Relatório sucinto para o Ministério Público (DIAP)"
        ],
        "critical_notes": [
            "Atenção ao valor: se o valor for insignificante (inferior a 1 UC - 102€) e destinado a uso momentâneo, pode ser furto de uso ou relevância atenuada.",
            "Se a vítima declarar que NÃO quer procedimento criminal, lavrar essa declaração de renúncia por escrito e arquivar o expediente no OPC com envio ao MP.",
            "Restituição: os bens recuperados devem ser entregues ao legítimo proprietário mediante Auto de Restituição (salvo necessidade pericial)."
        ]
    },
    {
        "id": "furto-qualificado",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Furto Qualificado",
        "article": "Artigo 204.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público na maioria das alíneas (ex: arrombamento, escalamento, chave falsa, residência, valor elevado/consideravelmente elevado). O procedimento NÃO depende de queixa.",
        "detention": "Em flagrante delito: detenção OBRIGATÓRIA pelo OPC (art. 255.º CPP). Condução imediata para apresentação ao MP ou libertação com TIR sob ordem do Procurador.",
        "steps": [
            "Preservar rigorosamente o local do crime: isolar com fita delimitadora (proibir entrada de familiares/curiosos).",
            "NÃO tocar em maçanetas, vidros partidos, gavetas ou superfícies passíveis de conter impressões lofoscópicas ou vestígios biológicos (ADN).",
            "Acionar de imediato o Núcleo de Investigação Criminal (NIC da GNR) ou Investigação Criminal (EIC da PSP) se aplicável.",
            "Identificar o modo de entrada (escalamento, arrombamento, chaves falsas) e registar fotograficamente.",
            "Identificar o suspeito caso intercetado e efetuar revista de segurança e apreensão dos instrumentos do crime (gazua, pés de cabra, luvas).",
            "Constituir arguido, aplicar TIR e recolher declarações.",
            "Contactar o Magistrado do Ministério Público de turno."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito (ou Denúncia se consumado anteriormente)",
            "Auto de Exame e Inspeção ao Local do Crime (com registo fotográfico e croquis)",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Auto de Apreensão (ferramentas utilizadas, bens subtraídos, vestuário/luvas)",
            "Notificação do Estatuto da Vítima (art. 67.º-A CPP)",
            "Comunicação imediata de detenção ao Ministério Público (prazo de 48h para interrogatório judicial)"
        ],
        "critical_notes": [
            "Por ser crime público, mesmo que o proprietário diga 'deixe lá, não quero chatices', o OPC é OBRIGADO por lei a abrir processo e investigar.",
            "A preservação de vestígios é a prioridade zero no furto qualificado em residência ou estabelecimento."
        ]
    },
    {
        "id": "abuso-confianca",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Abuso de Confiança",
        "article": "Artigo 205.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se valor consideravelmente elevado",
        "nature_desc": "Regra geral carece de queixa do ofendido. Passa a público se o valor for consideravelmente elevado (superior a 50 UC) ou com outras qualificações.",
        "detention": "Geralmente não há flagrante delito direto no terreno. Se ocorrer em flagrante de valor elevado: detenção possível.",
        "steps": [
            "Apurar como a coisa/dinheiro foi entregue licitamente ao suspeito (ex: contrato, depósito, guarda, empréstimo, função profissional).",
            "Verificar a data em que o suspeito inverteu o título de posse (ou seja, quando se recusou a devolver ou vendeu/gastou o que não era seu).",
            "Recolher comprovativos documentais: recibos, transferências, mensagens escritas a exigir a devolução, contratos de aluguer.",
            "Ouvir em declarações o ofendido e eventuais testemunhas.",
            "Notificar o suspeito para comparência e audição como arguido, se existirem fundadas suspeitas."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa do Ofendido",
            "Juntada de prova documental (contratos, comprovativos, trocas de mensagens)",
            "Auto de Inquirição de Testemunhas",
            "Auto de Constituição de Arguido e TIR (quando notificado)",
            "Relatório preliminar ao Ministério Público"
        ],
        "critical_notes": [
            "Distinção crucial: no furto o agente SUBTRAI a coisa alheia; no abuso de confiança o agente já TINHA a coisa legitimamente na sua posse por entrega do dono, mas recusa-se a devolver."
        ]
    },
    {
        "id": "apropriacao-ilegitima",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Apropriação Ilegítima de Coisa Achada ou Erro",
        "article": "Artigo 209.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do legítimo proprietário/achador no prazo de 6 meses.",
        "detention": "Raramente aplicável flagrante direto. Se o agente for intercetado a vender bem achado sabendo do proprietário: avaliar flagrante.",
        "steps": [
            "Verificar se o objeto foi achado na via pública/transporte ou se foi recebido por erro (ex: transferência bancária por engano).",
            "Apurar se decorreu o prazo legal sem comunicação à autoridade (o achador deve entregar a coisa à autoridade ou avisar o dono em prazo razoável).",
            "Recolher denúncia do legítimo dono (apresentando IMEI de telemóvel, número de quadro de bicicleta, etc.).",
            "Apreender o objeto que esteja na posse indevida do suspeito."
        ],
        "expediente_docs": [
            "Auto de Queixa / Denúncia",
            "Auto de Apreensão do bem recuperado",
            "Auto de Restituição ao proprietário comprovado",
            "Constituição de Arguido e TIR se verificada intenção de apropriação dolosa"
        ],
        "critical_notes": [
            "Quem encontra uma coisa perdida tem obrigação legal de entrega. Se após intimação expressa se recusar a devolver, consolida-se a apropriação ilegítima."
        ]
    },
    {
        "id": "roubo",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Roubo",
        "article": "Artigo 210.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público. Não carece de queixa. Ação penal obrigatória e imediata pelo OPC.",
        "detention": "Em flagrante delito: detenção OBRIGATÓRIA (art. 255.º CPP). Suspeito deve ser desarmado, algemado por razões de segurança e transportado para a subunidade policial.",
        "steps": [
            "Cessar a agressão/ameaça de imediato. Garantir apoio médico (INEM) prioritário à vítima se ferida.",
            "Intercetar o agressor: efetuar revista pessoal de segurança e busca sumária para apreensão de armas (brancas, de fogo, simulacros) e bens roubados.",
            "Preservar o local do crime caso haja vestígios biológicos (sangue), armas caídas ou danos.",
            "Recolher depoimento imediato da vítima: direção de fuga, características, vestuário, ameaças proferidas.",
            "Difundir de imediato o alerta geral à rede rádio policial com as características dos suspeitos e viatura de fuga.",
            "Conduzir o detido ao Posto/Esquadra, constituir arguido e aplicar TIR.",
            "Comunicar de imediato ao Magistrado do Ministério Público de turno."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Auto de Apreensão (armas, carteira, telemóveis, quantias monetárias, vestuário)",
            "Auto de Exame Direto e Registo Fotográfico aos bens e às lesões visíveis da vítima",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Auto de Inquirição de Testemunhas e Declarações da Vítima",
            "Ficha de Direitos e Estatuto da Vítima (art. 67.º-A CPP)",
            "Comunicação ao MP e expediente para 1.º Interrogatório Judicial de Arguido Detido"
        ],
        "critical_notes": [
            "Diferença entre Furto e Roubo: o roubo implica VIOLÊNCIA contra uma pessoa, ameaça com perigo iminente para a vida/integridade física, ou colocação da vítima na impossibilidade de resistir.",
            "Se cometido com arma (mesmo aparente/simulacro) ou em grupo organizado, trata-se de Roubo Agravado (art. 210.º, n.º 2 CP)."
        ]
    },
    {
        "id": "roubo-agravado",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Roubo Agravado",
        "article": "Artigo 210.º, n.º 2 do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público e de elevadíssima gravidade (art. 210.º n.º 2 conjugado com art. 204.º n.º 2 CP).",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito. Manter sob estrita custódia policial.",
        "steps": [
            "Prioridade máxima à integridade física de agentes e terceiros (suspeitos armados).",
            "Isolar o perímetro com fita policial e impedir contaminação do teatro de operações.",
            "Acionar meios especializados (NIC / Investigação Criminal e PJ se competência reservada / uso de arma de fogo).",
            "Apreender armas de fogo, munições, navalhas, máscaras/passa-montanhas sob rigoroso registo da cadeia de custódia.",
            "Garantir perícia médico-legal às vítimas agredidas."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão minucioso com cadeia de custódia de vestígios e armas",
            "Auto de Constituição de Arguido e Notificação de Direitos",
            "Termo de Identidade e Residência (TIR)",
            "Auto de Inquirição e Auto de Reconhecimento de Pessoas / Fotografias (art. 147.º CPP se aplicável)",
            "Ofício de apresentação de detido ao Juiz de Instrução Criminal / MP dentro do prazo de 48h"
        ],
        "critical_notes": [
            "Cuidado com a competência da PJ: roubos em bancos, instituições de crédito, transportes de valores ou com recurso a arma de fogo podem requerer comunicação imediata à Polícia Judiciária (Lei de Organização da Investigação Criminal - LOIC)."
        ]
    },
    {
        "id": "dano-simples",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Dano Simples",
        "article": "Artigo 212.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do proprietário/lesado no prazo de 6 meses (art. 115.º CP).",
        "detention": "Em flagrante delito: detenção facultativa/obrigatória pelo OPC mediante queixa no local ou para fins de identificação segura.",
        "steps": [
            "Fazer cessar a conduta e identificar todos os intervenientes.",
            "Recolher declarações do proprietário quanto ao desejo de queixa-crime.",
            "Fotografar detalhadamente os danos (ex: vidro partido de viatura, porta forçada, pintura danificada).",
            "Averiguar se existem orçamentos ou faturas de reparação para apuramento do montante do prejuízo.",
            "Apreender o objeto utilizado para causar o dano (martelo, pedra, barra de ferro)."
        ],
        "expediente_docs": [
            "Auto de Notícia ou Auto de Denúncia",
            "Auto de Declarações do Lesado com desejo formal de queixa e estimativa do dano",
            "Registo Fotográfico dos Danos",
            "Auto de Apreensão dos instrumentos do dano",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)"
        ],
        "critical_notes": [
            "Se o lesado não quiser apresentar queixa, documentar a desistência/renúncia expressa.",
            "Atenção se os danos forem em coisa pública ou valor elevado: qualifica-se como Dano Qualificado (art. 213.º CP), passando a CRIME PÚBLICO!"
        ]
    },
    {
        "id": "dano-qualificado",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Dano Qualificado",
        "article": "Artigo 213.º do Código Penal",
        "nature": "Público (maioria) / Semipúblico em certos casos",
        "nature_desc": "Regra geral crime público quando atinge coisa de valor elevado, interesse público, monumentos, bens afetos a serviços públicos/policiais/saúde ou vias de comunicação.",
        "detention": "Detenção obrigatória em flagrante delito se verificados os pressupostos do art. 255.º CPP.",
        "steps": [
            "Preservar o local e registar a extensão dos estragos.",
            "Identificar se o bem danificado pertence ao Estado, autarquias, transporte público, monumento ou património cultural.",
            "Apreender materiais inflamáveis, pedras, ferramentas ou sprays de graffitis/tintas.",
            "Intercetar os suspeitos e formalizar os atos processuais."
        ],
        "expediente_docs": [
            "Auto de Notícia",
            "Auto de Exame e Registo Fotográfico exaustivo",
            "Auto de Apreensão",
            "Constituição de Arguido e TIR",
            "Comunicação ao Ministério Público"
        ],
        "critical_notes": [
            "Danos em viaturas policiais, postos da GNR/PSP, comboios, autocarros ou hospitais enquadram-se em Dano Qualificado (crime público)."
        ]
    },
    {
        "id": "burla-simples",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Burla Simples",
        "article": "Artigo 217.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do ofendido no prazo de 6 meses (art. 115.º CP).",
        "detention": "Flagrante delito é raro (ex: burla do 'conto do vigário', burla presencial a idosos no ato de entrega do dinheiro): detenção imediata pelo OPC.",
        "steps": [
            "Apurar a astúcia ou erro provocado pelo burlão: como enganou a vítima para que esta praticasse atos prejudiciais ao seu património.",
            "Apreender o dinheiro, cheques falsos ou objetos entregues caso intercetados no momento.",
            "Recolher toda a prova documental e digital: extratos bancários, recibos MB WAY, comprovativos de pagamento, prints de conversas WhatsApp/redes sociais.",
            "Inquirir a vítima e testemunhas presenciais."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa do Ofendido com desejo expresso de procedimento criminal",
            "Juntada de Comprovativos Documentais e Digitais (extratos, IBANs, comprovativos MBWAY)",
            "Auto de Apreensão (se houver bens/valores recuperados)",
            "Constituição de Arguido e TIR (se suspeito intercetado)",
            "Notificação dos Direitos da Vítima"
        ],
        "critical_notes": [
            "Não confundir incumprimento contratual civil com burla penal. É essencial comprovar a INTENÇÃO inicial de enganar (astúcia induzindo em erro) com enriquecimento ilegítimo."
        ]
    },
    {
        "id": "burla-qualificada",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Burla Qualificada",
        "article": "Artigo 218.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando o prejuízo for de valor elevado (> 50 UC) ou consideravelmente elevado (> 200 UC), ou quando o agente faz da burla modo de vida, ou se aproveita de situação de fraqueza/vulnerabilidade da vítima.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Identificar o prejuízo patrimonial e as circunstâncias agravantes (ex: modo de vida, vítima idosa vulnerável).",
            "Apreender computadores, cartões de crédito/débito, telemóveis e quantias monetárias.",
            "Contactar o MP para adoção de medidas cautelares urgentes (ex: congelamento de contas bancárias nos termos da lei)."
        ],
        "expediente_docs": [
            "Auto de Notícia / Denúncia",
            "Auto de Apreensão de materiais informáticos, bancários e quantias",
            "Constituição de Arguido e TIR",
            "Ficha de Direitos e Estatuto da Vítima",
            "Comunicação imediata ao DIAP"
        ],
        "critical_notes": [
            "Burlas organizadas ou de valor consideravelmente elevado podem ter competência reservada da Polícia Judiciária nos termos da LOIC."
        ]
    },
    {
        "id": "receptacao",
        "category": "Património",
        "category_id": "patrimonio",
        "name": "Receptação",
        "article": "Artigo 231.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se o crime precedente for público",
        "nature_desc": "Depende da natureza do crime de onde provêm os objetos receptados (ex: se provêm de roubo ou furto qualificado, assume natureza pública).",
        "detention": "Em flagrante delito (ex: intercetado a adquirir ou vender material furtado com conhecimento manifesto da proveniência ilícita).",
        "steps": [
            "Intercetar o suspeito na posse de bens com suspeita de furto/roubo anterior.",
            "Cruzar números de série, IMEI de telemóveis, matrículas ou chassis com as bases de dados de objetos furtados (SIIC / base de dados da GNR/PSP).",
            "Apreender imediatamente os objetos receptados.",
            "Constituir o suspeito como arguido, garantindo o direito ao silêncio."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção ou Flagrante",
            "Auto de Apreensão minucioso dos objetos",
            "Certidão ou cruzamento com o Auto de Furto/Roubo original",
            "Constituição de Arguido e TIR"
        ],
        "critical_notes": [
            "O agente da receptação não pode ser o mesmo do furto. Se ele próprio furtou o bem, responde por furto, não por receptação."
        ]
    },

    # -------------------------------------------------------------
    # 2. PESSOAS
    # -------------------------------------------------------------
    {
        "id": "homicidio-simples",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Homicídio Simples",
        "article": "Artigo 131.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público de máxima prioridade. Ação penal oficiosa e inadiável.",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito pelo OPC (art. 255.º CPP).",
        "steps": [
            "Garantir apoio médico de emergência (INEM / VMER) caso haja hipótese de sobrevida.",
            "ISOLAMENTO RIGOROSO DO LOCAL: Proibir taxativamente a entrada de qualquer pessoa (incluindo outros militares/agentes não afetos ao exame do local).",
            "COMUNICAÇÃO IMEDIATA À POLÍCIA JUDICIÁRIA (PJ): O crime de homicídio é de competência reservada da PJ (art. 7.º da LOIC).",
            "Praticar apenas os atos cautelares inadiáveis e urgentes para assegurar os meios de prova (art. 249.º CPP).",
            "Se o suspeito estiver no local: desarmar, deter, isolar, preservar mãos e vestuário para deteção de vestígios de disparo/ADN.",
            "Identificar testemunhas presenciais e impedir que abandonem o local sem identificação."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar / Detenção",
            "Registo de Comunicação Imediata à Polícia Judiciária e ao Ministério Público",
            "Auto de Apreensão Cautelar de Armas e Objetos Urgentes",
            "Auto de Preservação do Local e Relação de Testemunhas",
            "Termo de Entrega de Local e de Detido à Polícia Judiciária"
        ],
        "critical_notes": [
            "NUNCA alterar a posição do cadáver ou de objetos circundantes, exceto para socorro médico comprovado.",
            "Não mexer em projéteis, cartuchos ou armas sem equipamento forense."
        ]
    },
    {
        "id": "homicidio-qualificado",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Homicídio Qualificado",
        "article": "Artigo 132.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público sob circunstâncias agravantes especiais (ex: veneno, asfixia, contra cônjuge/pais/filhos, contra agente policial em funções, por motivo fútil).",
        "detention": "Detenção OBRIGATÓRIA pelo OPC.",
        "steps": [
            "Idêntico ao Homicídio: Isolamento de área máxima.",
            "Comunicação imediata e transmissão do caso à Polícia Judiciária.",
            "Deter o agressor com máximas cautelas de segurança.",
            "Registar factos que evidenciem especial censurabilidade ou perversidade."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar / Detenção",
            "Auto de Preservação e Isolamento do Local do Crime",
            "Comunicação imediata à PJ e DIAP",
            "Entrega de local e suspeito à brigada da PJ de piquete"
        ],
        "critical_notes": [
            "Homicídio contra agentes das forças de segurança (GNR/PSP/PJ) é automaticamente qualificado nos termos da alínea l) do n.º 2 do art. 132.º CP."
        ]
    },
    {
        "id": "ofensa-integridade-fisica-simples",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Ofensa à Integridade Física Simples",
        "article": "Artigo 143.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa da vítima no prazo de 6 meses (art. 115.º CP). Sem queixa expressa, extingue-se o direito a procedimento.",
        "detention": "Em flagrante delito: detenção facultativa pelo OPC, apenas se o ofendido formular queixa de imediato ou para identificação se não tiver idoneidade.",
        "steps": [
            "Separar as partes e fazer cessar de imediato as agressões físicas.",
            "Prestar primeiros socorros e, se necessário, acionar INEM ou encaminhar a vítima ao hospital/centro de saúde mais próximo.",
            "Identificar com rigor o agressor, a vítima e testemunhas neutras.",
            "Questionar a vítima expressamente se pretende apresentar queixa-crime.",
            "Notificar a vítima para conservar todos os relatórios médicos, receitas e baixas clínicas.",
            "Encaminhar a vítima para exame pericial médico-legal (Gabinete Médico-Legal / IML) se houver lesões evidentes."
        ],
        "expediente_docs": [
            "Auto de Notícia (se presenciado) ou Denúncia",
            "Auto de Declarações da Vítima com declaração expressa de queixa",
            "Guia de Encaminhamento / Requisição de Exame Médico-Legal (IML)",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)",
            "Ficha de Notificação do Estatuto e Direitos da Vítima (art. 67.º-A CPP)"
        ],
        "critical_notes": [
            "ATENÇÃO CRUCIAL: Se as ofensas ocorrerem entre cônjuges, ex-cônjuges, namorados, ou pessoas que coabitem, NÃO É crime de ofensa simples: É CRIME DE VIOLÊNCIA DOMÉSTICA (Art. 152.º CP), que é PÚBLICO!"
        ]
    },
    {
        "id": "ofensa-integridade-fisica-grave",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Ofensa à Integridade Física Grave",
        "article": "Artigo 144.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público. Não depende de queixa quando resulta privação de membro/órgão, deformidade grave permanente, perigo para a vida, etc.",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito.",
        "steps": [
            "Socorro médico de urgência imediato à vítima.",
            "Deter o suspeito e apreender os instrumentos da agressão (facas, garrafas partidas, bastões).",
            "Isolar o local para recolha de vestígios hemáticos e biológicos.",
            "Constituir arguido, aplicar TIR e comunicar de imediato ao Ministério Público."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão de Armas e Objetos",
            "Requisição urgente de Exame Médico-Legal / Relatório Clínico Hospitalar",
            "Constituição de Arguido e Notificação de Direitos",
            "Termo de Identidade e Residência (TIR)",
            "Comunicação de Detido ao MP para interrogatório judicial"
        ],
        "critical_notes": [
            "Diferença entre simples e grave: perda de órgão importante, incapacidade para o trabalho por longo período, perigo de vida ou desfiguração permanente."
        ]
    },
    {
        "id": "violencia-domestica",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Violência Doméstica",
        "article": "Artigo 152.º do Código Penal",
        "nature": "Público",
        "nature_desc": "CRIME PÚBLICO! A atuação é sempre oficiosa e obrigatória. Mesmo que a vítima peça para retirar a queixa ou diga que já está tudo bem, o OPC NÃO PODE parar o processo.",
        "detention": "Em flagrante delito: DETENÇÃO OBRIGATÓRIA (art. 255.º CPP). Fora de flagrante: deter com mandado de detenção fora de flagrante emitido pelo MP se houver perigo de continuação criminosa.",
        "steps": [
            "Garantir a separação física imediata e total entre a vítima e o agressor.",
            "Garantir a integridade física de crianças/menores presentes no domicílio.",
            "Apreender CAUTELARMENTE e com urgência TODAS as armas de fogo/munições na posse do agressor (art. 31.º da Lei 112/2009).",
            "APLICAR O QUESTIONÁRIO DE AVALIAÇÃO DE RISCO (RVD) à vítima (obrigatório por lei).",
            "Informar a vítima sobre o Estatuto de Vítima, APAV, casas de abrigo de emergência e teleassistência.",
            "Se flagrante delito: deter o agressor, conduzir ao Posto/Esquadra, constituir arguido e mantê-lo sob custódia.",
            "Contactar o Ministério Público de turno para promoção de medidas de coação urgentes (ex: afastamento da residência com vigilância eletrónica)."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção (ou Denúncia)",
            "Questionário de Avaliação de Risco da Vítima de Violência Doméstica (Ficha RVD)",
            "Auto de Apreensão Cautelar de Armas, Munições e Licenças de Uso e Porte de Arma",
            "Auto de Declarações da Vítima (com histórico de agressões anteriores)",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Notificação do Estatuto de Vítima e Folheto de Direitos (Lei 112/2009 e art. 67.º-A CPP)",
            "Informação de acolhimento de urgência / Teleassistência / APAV",
            "Comunicação urgente e envio do processo ao Procurador de turno (DIAP)"
        ],
        "critical_notes": [
            "NUNCA realizar acareações ou tentar 'conciliações' no local entre vítima e agressor.",
            "As agressões psicológicas, injúrias reiteradas, ameaças e controlo económico no âmbito conjugal/familiar configuram violência doméstica.",
            "Crianças que presenciam a violência doméstica adquirem igualmente o estatuto de vítima."
        ]
    },
    {
        "id": "ameaca",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Ameaça",
        "article": "Artigo 153.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do ofendido no prazo de 6 meses (art. 115.º CP).",
        "detention": "Em flagrante delito apenas se houver queixa expressa imediata e a ameaça for com crime punível com prisão > 3 anos (Ameaça Agravada art. 155.º CP).",
        "steps": [
            "Fazer cessar a conduta e acalmar os ânimos.",
            "Identificar com rigor o suspeito e o ofendido.",
            "Registar com precisão as palavras exatas proferidas pelo suspeito (ex: 'eu mato-te', 'vou queimar o teu carro').",
            "Recolher suportes de prova: áudios, mensagens de telemóvel, emails, gravações, testemunhas presenciais.",
            "Questionar o ofendido se deseja procedimento criminal e lavrar declarações."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa do Ofendido",
            "Auto de Inquirição de Testemunhas",
            "Juntada de registos de mensagens, prints ou gravações",
            "Constituição de Arguido e TIR (se aplicável)"
        ],
        "critical_notes": [
            "A ameaça tem de ser de cometimento de um crime contra a vida, integridade física ou património, e idónea a causar medo ou inquietação na vítima.",
            "Se for com arma de fogo ou branca, passa a Ameaça Agravada (art. 155.º CP)."
        ]
    },
    {
        "id": "coacao",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Coação",
        "article": "Artigo 154.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se agravada",
        "nature_desc": "Carece de queixa da vítima, salvo se agravada nos termos do art. 155.º CP.",
        "detention": "Detenção em flagrante delito se verificados os pressupostos gerais e manifestação de queixa.",
        "steps": [
            "Verificar se o agente utilizou violência ou ameaça com mal importante para constranger a vítima a uma ação, omissão ou a suportar uma atividade.",
            "Fazer cessar o constrangimento e garantir a segurança do ofendido.",
            "Apreender instrumentos de coação e ouvir testemunhas."
        ],
        "expediente_docs": [
            "Auto de Queixa / Denúncia",
            "Auto de Declarações da Vítima",
            "Constituição de Arguido e TIR"
        ],
        "critical_notes": [
            "Diferença da ameaça simples: na coação o agressor exige que a vítima FAÇA ou DEIXE DE FAZER algo contra a sua vontade."
        ]
    },
    {
        "id": "perseguicao-stalking",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Perseguição (Stalking)",
        "article": "Artigo 154.º-A do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do ofendido no prazo de 6 meses (art. 115.º CP).",
        "detention": "Em flagrante delito se intercetado a seguir persistentemente a vítima e esta apresentar queixa imediata.",
        "steps": [
            "Averiguar a persistência da conduta: vigilância junto à residência/trabalho, perseguições na rua, contactos telefónicos e mensagens reiteradas.",
            "Apurar o efeito na vítima: se causou medo, inquietação ou prejuízo na sua liberdade de determinação/rotinas diárias.",
            "Recolher histórico de mensagens, chamadas não atendidas, cartas, presentes não solicitados, registos de GPS/airtags.",
            "Notificar a vítima dos seus direitos e alertar para medidas de segurança pessoal."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa com histórico cronológico detalhado das perseguições",
            "Juntada de registos informáticos, capturas de ecrã e gravações",
            "Constituição de Arguido e TIR",
            "Estatuto da Vítima"
        ],
        "critical_notes": [
            "Se o perseguidor for ex-cônjuge ou ex-namorado, a conduta integra habitualmente o crime de Violência Doméstica (art. 152.º CP), que é PÚBLICO!"
        ]
    },
    {
        "id": "sequestro",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Sequestro",
        "article": "Artigo 158.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se agravado",
        "nature_desc": "Regra geral semipúblico, mas passa a PÚBLICO se a privação da liberdade durar mais de 2 dias, se for precedida de tortura, contra pessoa indefesa ou simulando autoridade pública.",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito.",
        "steps": [
            "Libertar com segurança a vítima retida contra a sua vontade (em quarto trancado, armazém, veículo).",
            "Imobilizar e deter o autor do sequestro.",
            "Prestar auxílio médico imediato à vítima.",
            "Apreender chaves, correntes, cordas, fitas adesivas ou armas utilizadas para imobilização.",
            "Comunicar de imediato ao Ministério Público."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão dos meios de retenção/imobilização",
            "Auto de Exame ao Local de Confinamento",
            "Constituição de Arguido e TIR",
            "Notificação do Estatuto da Vítima",
            "Comunicação ao MP"
        ],
        "critical_notes": [
            "Se o sequestro visar obtenção de resgate ou entrega de bens, trata-se de Rapto ou Extorsão."
        ]
    },
    {
        "id": "rapto",
        "category": "Pessoas",
        "category_id": "pessoas",
        "name": "Rapto",
        "article": "Artigo 161.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público grave de competência reservada da Polícia Judiciária.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "COMUNICAÇÃO IMEDIATA À POLÍCIA JUDICIÁRIA (competência reservada - LOIC).",
            "Praticar apenas atos cautelares urgentes de preservação e proteção da vítima.",
            "Difundir de imediato matrícula e características do veículo usado no rapto.",
            "Isolar o local de onde a vítima foi arrebatada."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar",
            "Registo de Comunicação Imediata à PJ",
            "Relatório de diligências efetuadas e transmissão à PJ"
        ],
        "critical_notes": [
            "Não negociar nem interferir sem coordenação com a PJ."
        ]
    },

    # -------------------------------------------------------------
    # 3. CRIMES SEXUAIS
    # -------------------------------------------------------------
    {
        "id": "coacao-sexual",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Coação Sexual",
        "article": "Artigo 163.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se vítima vulnerável ou incapaz",
        "nature_desc": "Carece de queixa do ofendido, salvo se cometido contra menor, incapaz ou se resultar suicídio/morte.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Garantir proteção e acompanhamento psicológico/médico prioritário à vítima.",
            "Evitar que a vítima lave o corpo, tome banho, mude de roupa ou escove os dentes antes da perícia médico-legal (preservação de ADN do agressor).",
            "Acondicionar o vestuário da vítima em sacos de papel (nunca plástico) para exame lofoscópico e biológico.",
            "Acionar piquete da Polícia Judiciária / NIC.",
            "Deter o suspeito caso intercetado."
        ],
        "expediente_docs": [
            "Auto de Notícia / Denúncia",
            "Guia urgente para Exame Médico-Legal em Gabinete de Medicina Legal",
            "Auto de Apreensão de vestuário e objetos",
            "Constituição de Arguido e TIR (se OPC tiver competência delegada)",
            "Estatuto da Vítima especialmente vulnerável"
        ],
        "critical_notes": [
            "Ouvir a vítima com o máximo respeito, privacidade e, sempre que possível, por agente do mesmo género se assim a vítima preferir."
        ]
    },
    {
        "id": "violacao",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Violação",
        "article": "Artigo 164.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se contra menores/incapazes ou agravada",
        "nature_desc": "Carece de queixa salvo situações de vulnerabilidade, menoridade, suicídio ou morte. Competência reservada da PJ.",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito.",
        "steps": [
            "COMUNICAÇÃO IMEDIATA À POLÍCIA JUDICIÁRIA (competência reservada - art. 7.º LOIC).",
            "Encaminhar de imediato a vítima para serviço de urgência ginecológica/hospitalar com Gabinete Médico-Legal para colheita urgente de ADN e profilaxia de infeções/gravidez.",
            "PRESERVAÇÃO ABSOLUTA DE VESTÍGIOS: Proibir que a vítima se lave ou troque de roupa.",
            "Isolar o local exato do crime (cama, sofá, chão, automóvel).",
            "Se o suspeito for intercetado: deter e preservar as suas mãos e vestuário para perícias biológicas."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar",
            "Comunicação imediata à PJ e DIAP de turno",
            "Guia de Encaminhamento Hospitalar / IML",
            "Termo de Entrega de Local e Detido à Polícia Judiciária",
            "Ficha de Vítima Especialmente Vulnerável"
        ],
        "critical_notes": [
            "A preservação de vestígios biológicos nas primeiras horas é determinante para a prova forense."
        ]
    },
    {
        "id": "abuso-sexual-incapaz",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Abuso Sexual de Pessoa Incapaz de Resistência",
        "article": "Artigo 165.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando a vítima está inconsciente, drogada, alcoolizada em coma ou com anomalia psíquica.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Proteger a vítima e solicitar assistência médica de emergência com colheitas toxicológicas imediatas no hospital.",
            "Comunicação imediata à Polícia Judiciária.",
            "Apreender copos, garrafas, substâncias ou medicamentos suspeitos de terem sido utilizados para submissão química.",
            "Deter o suspeito."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar",
            "Auto de Apreensão de recipientes e substâncias",
            "Comunicação à PJ e DIAP",
            "Relatório preliminar"
        ],
        "critical_notes": [
            "Colheitas de urina e sangue no hospital devem ser feitas o mais rápido possível para deteção de drogas de submissão (ex: GHB, benzodiazepinas)."
        ]
    },
    {
        "id": "importunacao-sexual",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Importunação Sexual",
        "article": "Artigo 170.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa da vítima no prazo de 6 meses. Exibe atos de caráter exibicionista, apalpões ou propostas sexuais constrangedoras.",
        "detention": "Em flagrante delito se houver queixa no local ou para identificação do suspeito.",
        "steps": [
            "Identificar de imediato o suspeito e a vítima.",
            "Ouvir declarações da vítima confirmando o desejo expresso de queixa.",
            "Identificar testemunhas presenciais no transporte, rua ou estabelecimento.",
            "Recolher imagens de videovigilância que comprovem a conduta (exibições, toques indesejados).",
            "Constituir arguido e aplicar TIR."
        ],
        "expediente_docs": [
            "Auto de Notícia ou Denúncia",
            "Auto de Declarações da Vítima com queixa expressa",
            "Auto de Inquirição de Testemunhas",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)",
            "Estatuto da Vítima"
        ],
        "critical_notes": [
            "Se o ato envolver contacto físico grave ou coação mediante violência, pode convolar para Coação Sexual ou Violação."
        ]
    },
    {
        "id": "abuso-sexual-criancas",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Abuso Sexual de Crianças",
        "article": "Artigo 171.º do Código Penal",
        "nature": "Público",
        "nature_desc": "CRIME PÚBLICO! Atuação oficiosa, prioritária e incondicional.",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito.",
        "steps": [
            "PROTEGER A CRIANÇA com o máximo cuidado psicológico e físico.",
            "COMUNICAÇÃO IMEDIATA À POLÍCIA JUDICIÁRIA (competência reservada - LOIC).",
            "NÃO inquirir a criança de forma exaustiva nem repetir perguntas para evitar a vitimização secundária (as declarações para memória futura serão tomadas em tribunal pelo juiz com psicólogo).",
            "Comunicação imediata à CPCJ (Comissão de Proteção de Crianças e Jovens) e ao MP de Família e Menores.",
            "Se flagrante delito: deter de imediato o agressor e isolar da criança e da família.",
            "Apreender equipamentos informáticos, telemóveis e câmaras do suspeito."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar / Detenção",
            "Comunicação Imediata à Polícia Judiciária e ao DIAP",
            "Comunicação à CPCJ e ao Tribunal de Família e Menores",
            "Auto de Apreensão Cautelar de Dispositivos Eletrónicos",
            "Termo de Entrega de Suspeito à PJ",
            "Ficha de Estatuto de Vítima Menor"
        ],
        "critical_notes": [
            "Evitar qualquer contacto entre o agressor e a criança.",
            "Respeitar o regime de declarações para memória futura (art. 271.º CPP)."
        ]
    },
    {
        "id": "pornografia-menores",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Pornografia de Menores",
        "article": "Artigo 176.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público e de competência reservada da Polícia Judiciária.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Apreender sem ligar/manipular computadores, telemóveis, discos rígidos e pen drives (preservação forense digital).",
            "Comunicar de imediato à PJ e ao MP.",
            "Deter o suspeito."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar",
            "Auto de Apreensão de Dispositivos com cadeia de custódia informática",
            "Transmissão imediata à PJ"
        ],
        "critical_notes": [
            "Nunca abrir nem visualizar ficheiros por curiosidade: altera os carimbos de data/hora (hashes) dos ficheiros e invalida a prova pericial."
        ]
    },
    {
        "id": "lenocinio",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Lenocínio",
        "article": "Artigo 169.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público (fomentar, favorecer ou facilitar o exercício de prostituição de outrem explorando a situação de abandono ou necessidade).",
        "detention": "Detenção em flagrante delito se reunidos os elementos materiais.",
        "steps": [
            "Identificar quem explora o estabelecimento/residência e quem recebe as percentagens financeiras.",
            "Apreender dinheiro, livros de registo, telemóveis e contratos de arrendamento.",
            "Identificar as pessoas em situação de prostituição com garantia de apoio social/vítima."
        ],
        "expediente_docs": [
            "Auto de Notícia",
            "Auto de Apreensão de quantias monetárias e registos contabilísticos",
            "Constituição de Arguido e TIR",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "A prostituição individual em si não é crime em Portugal; o crime é o LENOCÍNIO (a exploração económica da prostituição de terceiros)."
        ]
    },

    # -------------------------------------------------------------
    # 4. AUTORIDADE PÚBLICA
    # -------------------------------------------------------------
    {
        "id": "resistencia-coacao-funcionario",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Resistência e Coação sobre Funcionário",
        "article": "Artigo 347.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público contra o militar da GNR / agente da PSP no exercício das suas funções ou por causa delas.",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP). Condução imediata à subunidade policial.",
        "steps": [
            "Usar a força estritamente necessária e proporcional para repelir a agressão e imobilizar o suspeito.",
            "Algemar o agressor por razões de segurança do próprio detido, dos agentes e de terceiros.",
            "Realizar revista de segurança no local para garantir que não tem armas brancas ou de fogo escondidas.",
            "Transportar o detido para o Posto/Esquadra.",
            "Prestar apoio médico no hospital tanto aos militares/agentes agredidos como ao detido caso apresentem escoriações ou lesões.",
            "Constituir arguido, notificar direitos e aplicar TIR.",
            "Contactar o Ministério Público de turno para procedimento sumário (se preenchidos os requisitos) ou primeiro interrogatório judicial."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito (minucioso quanto aos atos de violência física e ameaças graves)",
            "Relatórios de Uso da Força e de Aplicação de Algemas",
            "Fichas de Episódio de Urgência Hospitalar dos Militares/Agentes e do Detido",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Auto de Inquirição de Militares/Testemunhas civis que presenciaram",
            "Comunicação de Detido ao Ministério Público para validação da detenção"
        ],
        "critical_notes": [
            "DISTINÇÃO FUNDAMENTAL: Meros insultos, discussões verbais ou desacatos NÃO constituem crime de Resistência e Coação sobre Funcionário! O crime do art. 347.º EXIGE o emprego de VIOLÊNCIA FÍSICA ou AMEAÇA GRAVE para impedir o agente de praticar um ato legítimo de serviço.",
            "Se houver apenas insultos sem violência: constitui crime de Injúria Agravada (art. 181.º c/c 184.º CP) e/ou Desobediência caso viole uma ordem legítima."
        ]
    },
    {
        "id": "desobediencia-simples",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Desobediência Simples",
        "article": "Artigo 348.º, n.º 1, alínea b) do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando o militar/agente faz a cominação formal e legal de que a falta de cumprimento da ordem faz incorrer no crime de desobediência.",
        "detention": "Em flagrante delito: detenção obrigatória após consumada a desobediência e esgotada a advertência legal.",
        "steps": [
            "Dar uma ordem clara, legítima e direta ao cidadão (ex: ordem de desmobilização, saída de local vedado).",
            "Advertir expressamente: 'Admoesto-o de que, se não cumprir esta ordem legítima, incorre no crime de Desobediência previsto no artigo 348.º do Código Penal!'",
            "Aguardar tempo razoável para acatamento.",
            "Se persistir na recusa: declarar o indivíduo DETIDO por crime de desobediência.",
            "Algemar se necessário e conduzir à subunidade policial.",
            "Constituir arguido e lavrar expediente."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção com reprodução EXATA das palavras da cominação/advertência",
            "Auto de Constituição de Arguido e Direitos",
            "Termo de Identidade e Residência - TIR",
            "Comunicação ao Ministério Público"
        ],
        "critical_notes": [
            "REQUISITO ESSENCIAL: Sem a cominação prévia expressa da alínea b), o tribunal anula a detenção e absolve o arguido! O agente TEM de ter avisado que o não cumprimento constitui crime de desobediência."
        ]
    },
    {
        "id": "desobediencia-qualificada",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Desobediência Qualificada",
        "article": "Artigo 348.º, n.º 2 do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando uma disposição legal específica determina que determinada conduta é punida com a pena de desobediência qualificada (ex: recusa de teste de álcool no trânsito - art. 152.º n.º 3 do Código da Estrada).",
        "detention": "Detenção OBRIGATÓRIA em flagrante delito.",
        "steps": [
            "Verificar a previsão legal especial (ex: recusa a submeter-se ao teste de alcoolemia ou de estupefacientes).",
            "Notificar e advertir o condutor da consequência legal imediata.",
            "Perante a recusa formal mantida: dar voz de detenção imediata.",
            "Impedir a condução do veículo.",
            "Conduzir ao Posto/Esquadra para expediente sumário."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Auto de Notificação da Recusa e Cominação Legal",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)",
            "Notificação para comparência em Processo Sumário perante o Tribunal / MP"
        ],
        "critical_notes": [
            "A recusa de teste de alcoolemia é o caso prático mais frequente de desobediência qualificada no terreno policial."
        ]
    },
    {
        "id": "usurpacao-funcoes",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Usurpação de Funções",
        "article": "Artigo 358.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando alguém exerce funções ou atos próprios de funcionário público, militar da GNR ou agente policial sem ter sido para tal nomeado.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Intercetar o suspeito que se faz passar por polícia ou militar.",
            "Apreender fardamento ilegal, coletes refletores com dísticos falsos, distintivos, carteiras profissionais falsas, rotativos luminosos azuis ou sirenes montadas na viatura civil.",
            "Deter o suspeito e conduzir à subunidade."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão dos fardamentos, insígnias e equipamentos",
            "Constituição de Arguido e TIR",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "Comum em burlas a idosos ou indivíduos que usam girofaróis azuis para mandar parar condutores na estrada."
        ]
    },
    {
        "id": "falsificacao-documento",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Falsificação de Documento",
        "article": "Artigo 256.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público na maioria dos casos (documentos autênticos, cartas de condução, passaportes, cartões de cidadão, matrículas de veículos).",
        "detention": "Detenção obrigatória em flagrante delito se apresentado perante o OPC.",
        "steps": [
            "Detetar a anomalia física no documento (carta de condução falsa, dísticos de inspeção/seguro contrafeitos, matrícula trocada).",
            "Validar eletronicamente nas bases de dados (IMT, BD GNR/PSP, Sistema Schengen).",
            "Apreender cautelarmente o documento sob estrito registo.",
            "Constituir o condutor/cidadão como arguido e aplicar TIR.",
            "Remeter o documento apreendido para perícia documentoscópica (LPC da PJ)."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção / Apreensão",
            "Auto de Apreensão do documento falsificado",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)",
            "Ofício de remessa ao MP e pedido de perícia documentoscópica"
        ],
        "critical_notes": [
            "Matrículas de veículos pertencentes a outro carro constituem falsificação de documento autêntico (art. 256.º n.º 1 e 3 CP)."
        ]
    },
    {
        "id": "falsas-declaracoes",
        "category": "Autoridade Pública",
        "category_id": "autoridade",
        "name": "Falsas Declarações",
        "article": "Artigo 359.º e 360.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando um cidadão presta falso depoimento ou declaração sobre identidade perante autoridade pública.",
        "detention": "Detenção em flagrante delito se o indivíduo facultar intencionalmente identidade de terceiro para ocultar mandado de captura.",
        "steps": [
            "Confrontar a divergência de dados de identificação.",
            "Submeter a identificação datiloscópica / lofoscópica (impressões digitais) se persistirem dúvidas.",
            "Apurar a verdadeira identidade.",
            "Deter pelo crime e verificar existência de mandados pendentes."
        ],
        "expediente_docs": [
            "Auto de Notícia",
            "Ficha de Identificação Lofoscópica",
            "Constituição de Arguido e TIR",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "O arguido tem direito ao silêncio quanto aos factos, mas é obrigado por lei a declarar com verdade a sua identidade completa e morada para o TIR."
        ]
    },

    # -------------------------------------------------------------
    # 5. RODOVIÁRIOS
    # -------------------------------------------------------------
    {
        "id": "conducao-embriaguez",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Condução em Estado de Embriaguez (TAS >= 1,20 g/l)",
        "article": "Artigo 292.º, n.º 1 do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público rodoviário quando a Taxa de Álcool no Sangue (TAS) atinge ou ultrapassa 1,20 g/l (com a dedução do Erro Máximo Admissível - EMA).",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Fiscalização e realização do teste de ar expirado em alcoolímetro quantitativo homologado.",
            "Verificar o valor apurado no talão impresso e deduzir a margem de erro (EMA) nos termos da portaria metrológica.",
            "Se o valor final deduzido for IGUAL OU SUPERIOR A 1,20 g/l: declarar imediatamente o condutor DETIDO.",
            "Notificar o condutor do direito legal de requerer contraprova (novo sopro no alcoolímetro ou colheita de sangue em hospital).",
            "Notificar o condutor da IMPEDÊNCIA LEGAL DE CONDUZIR durante o período de 12 horas (art. 154.º do Código da Estrada).",
            "Garantir a imobilização e estacionamento em local seguro do veículo (ou entrega a terceiro devidamente habilitado e com teste 0,00 g/l).",
            "Conduzir o detido ao Posto/Esquadra, constituir arguido e aplicar TIR.",
            "Notificar para comparecer no tribunal da comarca competente para julgamento em Processo Sumário (art. 381.º CPP)."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Talão original do alcoolímetro quantitativo com a assinatura do autuante",
            "Notificação dos Direitos de Contraprova e resultado do teste",
            "Auto de Notificação de Impedimento de Conduzir durante 12 horas (art. 154.º CE)",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Notificação de Notificação de Comparência em Tribunal (Processo Sumário)"
        ],
        "critical_notes": [
            "Se a contraprova for requerida em hospital: conduzir de imediato ao serviço de saúde mais próximo para colheita por médico/enfermeiro e selagem das ampolas do kit forense.",
            "Se o condutor se RECUSAR a fazer o teste de ar expirado ou a contraprova: DETENÇÃO IMEDIATA por crime de DESOBEDIÊNCIA QUALIFICADA (art. 348.º n.º 2 CP c/c art. 152.º n.º 3 CE)!"
        ]
    },
    {
        "id": "conducao-estupefacientes",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Condução sob Influência de Estupefacientes",
        "article": "Artigo 292.º, n.º 2 do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando o condutor se encontra a conduzir veículo sob a influência comprovada de substâncias psicotrópicas ou estupefacientes.",
        "detention": "Detenção em flagrante delito após confirmação pericial médica/laboratorial.",
        "steps": [
            "Submeter a teste de saliva/urina de despistagem rápida com equipamento homologado (ex: Dräger DrugTest).",
            "Perante resultado positivo na despistagem: o condutor TEM de ser conduzido obrigatoriamente a estabelecimento hospitalar para colheita de sangue.",
            "Notificar impedimento de conduzir durante 48 horas (art. 154.º CE).",
            "Imobilizar a viatura.",
            "Constituir arguido, aplicar TIR e aguardar relatório toxicológico definitivo do Instituto Nacional de Medicina Legal (INMLCF)."
        ],
        "expediente_docs": [
            "Auto de Notícia",
            "Talão / Registo do teste de despistagem rápida de drogas",
            "Guia de Encaminhamento para Colheita de Sangue em Hospital e Kit INMLCF",
            "Auto de Notificação de Impedimento de Conduzir durante 48 horas",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)"
        ],
        "critical_notes": [
            "A recusa em submeter-se ao teste rápido ou à colheita médica de sangue no hospital constitui Crime de Desobediência Qualificada."
        ]
    },
    {
        "id": "conducao-sem-habilitacao",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Condução Sem Habilitação Legal",
        "article": "Artigo 3.º, n.º 1 e 2 do Decreto-Lei n.º 2/98",
        "nature": "Público",
        "nature_desc": "Crime público para quem conduzir veículo a motor na via pública sem para tal estar legalmente habilitado (sem nunca ter tirado carta ou para categoria manifestamente diferente).",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Fiscalizar o condutor e solicitar a carta de condução.",
            "Se o condutor declarar não possuir ou apresentar documento falso/inválido: consultar de imediato a base de dados do IMT / SIIC.",
            "Confirmada a inexistência de título de condução: dar voz de DETENÇÃO IMEDIATA.",
            "Impedir o prosseguimento da marcha do veículo e imobilizá-lo em local seguro.",
            "Conduzir o detido ao Posto/Esquadra.",
            "Constituir arguido, notificar direitos e aplicar TIR.",
            "Notificar para comparência no Tribunal Judicial competente em Processo Sumário."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Comprovativo da pesquisa à base de dados do IMT (certidão de não encartado)",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Notificação para Audiência de Julgamento em Processo Sumário perante o Tribunal"
        ],
        "critical_notes": [
            "NÃO CONFUNDIR: Se o condutor tem carta válida mas caducada (ex: caducou há menos de 2 anos ou não revalidou na idade legal), é MERA CONTRAORDENAÇÃO rodoviária ao Código da Estrada, e NÃO CRIME!",
            "O crime aplica-se a quem NUNCA foi titular de carta de condução para a categoria do veículo conduzido (ex: guiar ligeiros sem carta, ou guiar pesados só com carta de ciclomotor)."
        ]
    },
    {
        "id": "conducao-perigosa",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Condução Perigosa de Veículo Rodoviário",
        "article": "Artigo 291.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público quando o condutor viola grosseiramente regras da circulação criando perigo concreto para a vida ou integridade física alheia ou bens de valor elevado.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Fazer cessar a condução de perigo (ex: circular em contramão em autoestrada, excesso desmedido em corridas ilegais/'street racing', ultrapassagens cegas em curvas).",
            "Intercetar a viatura com todas as normas de segurança.",
            "Identificar testemunhas e outros condutores colocados em perigo concreto.",
            "Constituir arguido e aplicar TIR.",
            "Remeter ao MP."
        ],
        "expediente_docs": [
            "Auto de Notícia minucioso com descrição detalhada da manobra e perigo concreto criado",
            "Auto de Inquirição de Condutores/Testemunhas colocados em risco",
            "Constituição de Arguido e TIR",
            "Apreensão do veículo como instrumento do crime caso determinado judicialmente"
        ],
        "critical_notes": [
            "O crime exige a criação de perigo CONCRETO para pessoas ou bens alheios de valor elevado. Não basta conduzir rápido sem ninguém por perto."
        ]
    },
    {
        "id": "omissao-auxilio-transito",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Omissão de Auxílio em Acidente de Viação",
        "article": "Artigo 200.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público para quem, em caso de acidente rodoviário de que resultem vítimas, não prestar o auxílio necessário que estiver ao seu alcance.",
        "detention": "Detenção em flagrante se intercetado em fuga logo após o acidente sem prestar socorro.",
        "steps": [
            "Prioridade absoluta ao socorro das vítimas no local do acidente.",
            "Se o condutor causador se colocou em fuga: recolher de imediato fragmentos do veículo no local (plásticos, faróis partidos, cor de tinta), marcas de travagem e imagens de câmaras de autoestrada/estações de serviço.",
            "Difundir alerta às patrulhas com a matrícula/modelo do veículo em fuga.",
            "Ao localizar o condutor: verificar danos correspondentes na viatura, constituir arguido e apreender a viatura para perícia."
        ],
        "expediente_docs": [
            "Auto de Acidente de Viação com Fuga",
            "Auto de Notícia por Omissão de Auxílio",
            "Auto de Apreensão da Viatura para Exame Pericial de Correspondência de Danos",
            "Constituição de Arguido e TIR",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "A omissão de auxílio não depende de ser o culpado pelo acidente: qualquer condutor interveniente ou presente tem o dever cívico e legal de prestar socorro."
        ]
    },

    # -------------------------------------------------------------
    # 6. DROGAS / ESTUPEFACIENTES (DL 15/93)
    # -------------------------------------------------------------
    {
        "id": "consumo-detencao-proprio",
        "category": "Drogas",
        "category_id": "drogas",
        "name": "Consumo / Detenção para Consumo Próprio",
        "article": "Lei n.º 30/2000 vs. Artigo 40.º do Decreto-Lei n.º 15/93",
        "nature": "Contraordenação (regra até 10 dias) / Crime (acima do limite sem tráfico)",
        "nature_desc": "Descriminalizado em regra: se a quantidade apreendida NÃO exceder a quantidade necessária para o consumo médio individual durante o período de 10 dias (Portaria n.º 94/96) e não houver indícios de venda, é MERA CONTRAORDENAÇÃO!",
        "detention": "NÃO HÁ DETENÇÃO se for mero consumo contraordenacional! Apenas apreensão e notificação para a CDT.",
        "steps": [
            "Realizar revista pessoal de segurança e apreender a substância estupefaciente.",
            "Pesar a substância em balança aferida para apurar o peso bruto e líquido.",
            "Calcular as doses individuais diárias segundo a Portaria 94/96 (ex: Haxixe/Resina canábis = 0,5g/dia -> limite 10 dias = 5g; Erva/Folhas = 2,5g/dia -> limite 10 dias = 25g; Cocaína = 0,2g/dia -> limite 10 dias = 2g; Heroína = 0,1g/dia -> limite 10 dias = 1g).",
            "Verificar se existem indícios de tráfico (balança de precisão, sacos de corte individuais, dinheiro fracionado): se NÃO houver e for inferior ao limite dos 10 dias:",
            "Elaborar Auto de Apreensão e Auto de Notícia por Contraordenação e notificar o cidadão para comparecer na CDT (Comissão para a Dissuasão da Toxicodependência).",
            "Se exceder os 10 dias mas se provar exclusivamente para consumo pessoal: crime do art. 40.º n.º 2 do DL 15/93."
        ],
        "expediente_docs": [
            "Auto de Apreensão da Substância Estupefaciente",
            "Auto de Pesagem Provisória",
            "Auto de Ocorrência / Notícia de Contraordenação da Lei 30/2000 para a CDT",
            "Notificação do Infrator para comparência na Comissão de Dissuasão da Toxicodependência",
            "Envio do produto estupefaciente para o Laboratório de Polícia Científica (LPC) da PJ para destruição/exame pericial"
        ],
        "critical_notes": [
            "ERRO COMUM NO TERRENO: Consumo pessoal até ao limite dos 10 dias NÃO DÁ DETENÇÃO! Não algemar nem constituir arguido por tráfico sem prova de distribuição/venda.",
            "O produto apreendido é sempre confiscado a favor do Estado, mesmo sendo contraordenação."
        ]
    },
    {
        "id": "trafico-menor-gravidade",
        "category": "Drogas",
        "category_id": "drogas",
        "name": "Tráfico de Menor Gravidade",
        "article": "Artigo 25.º do Decreto-Lei n.º 15/93",
        "nature": "Público",
        "nature_desc": "Crime público quando a ilicitude do facto se mostrar consideravelmente diminuída pelos meios utilizados, modalidades, circunstâncias da ação e quantidade/qualidade das plantas ou substâncias.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Intercetar o suspeito em ato de venda direta no terreno ou com produto individualizado em doses prontas para venda.",
            "Revista pessoal e busca sumária: apreender produto embalado, dinheiro trocado (moedas e notas pequenas de 5€, 10€, 20€), telemóveis de contacto com clientes.",
            "Pesar e realizar teste rápido reagente (teste colorimétrico) para identificação presuntiva da substância.",
            "Deter o suspeito e conduzir à subunidade policial.",
            "Constituir arguido, aplicar TIR e comunicar de imediato ao Ministério Público."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Auto de Apreensão de Estupefacientes, Dinheiro e Dispositivos Móveis",
            "Auto de Pesagem e Teste Reagente Rápido",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Comunicação ao Procurador da República (DIAP)"
        ],
        "critical_notes": [
            "O dinheiro fracionado junto ao produto individualizado em 'panfletos' ou 'trouxas' é o indício mais forte de tráfico no terreno."
        ]
    },
    {
        "id": "trafico-estupefacientes",
        "category": "Drogas",
        "category_id": "drogas",
        "name": "Tráfico de Estupefacientes",
        "article": "Artigo 21.º do Decreto-Lei n.º 15/93",
        "nature": "Público",
        "nature_desc": "Crime público grave abrangendo quem cultivar, produzir, fabricar, extrair, preparar, oferecer, vender, distribuir, comprar ou detiver substâncias proibidas das tabelas I a III.",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Intercetar os suspeitos com estritas regras de segurança e imobilização.",
            "Preservar todas as substâncias, balanças de precisão, material de corte (paracetamol, cafeína) e acondicionamento (rolos de celofane, sacos 'zip').",
            "Apreender viaturas utilizadas para o transporte de estupefaciente (art. 35.º do DL 15/93).",
            "Solicitar mandados de busca domiciliária urgentes ao Ministério Público se houver fundadas suspeitas de esconderijo.",
            "Enviar o estupefaciente sob rigorosa cadeia de custódia ao Laboratório de Polícia Científica (LPC) da PJ."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão pormenorizado de drogas, viaturas, telemóveis e quantias",
            "Auto de Pesagem Rigorosa com balança certificada",
            "Constituição de Arguido e TIR",
            "Comunicação ao MP para 1.º Interrogatório Judicial para aplicação de Prisão Preventiva"
        ],
        "critical_notes": [
            "Atenção à LOIC: grandes redes de tráfico internacional ou quantidades muito elevadas requerem comunicação imediata e transmissão à Polícia Judiciária."
        ]
    },
    {
        "id": "cultivo-ilicito",
        "category": "Drogas",
        "category_id": "drogas",
        "name": "Cultivo Ilícito de Cannabis / Plantas",
        "article": "Artigo 21.º / 25.º / 40.º do Decreto-Lei n.º 15/93",
        "nature": "Público",
        "nature_desc": "O cultivo de plantas de canábis é expressamente proibido sem autorização do INFARMED.",
        "detention": "Detenção em flagrante delito se estufa ou número relevante de plantas destinadas ao tráfico.",
        "steps": [
            "Localizar e fotografar as plantas no seu estado natural (terreno ou interior com estufa).",
            "Apreender e erradicar as plantas de cannabis, registando a quantidade de pés e o seu desenvolvimento.",
            "Apreender sistemas de iluminação, ventilação, fertilizantes e desumidificadores.",
            "Identificar os responsáveis pela propriedade/cultivo.",
            "Encaminhar as plantas para o LPC para análise do teor de THC e destruição legal."
        ],
        "expediente_docs": [
            "Auto de Notícia por Apreensão / Detenção",
            "Auto de Apreensão e Contagem de Plantas e Equipamentos de Cultivo",
            "Registo Fotográfico do Local de Cultivo / Estufa",
            "Constituição de Arguido e TIR",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "Cultivar plantas de canábis em casa, mesmo que para alegação de consumo próprio, NÃO está abrangido pela descriminalização da Lei 30/2000 (o art. 40.º do DL 15/93 mantém a punição)."
        ]
    },

    # -------------------------------------------------------------
    # 7. ARMAS E MUNIÇÕES (Lei 5/2006 - RJAM)
    # -------------------------------------------------------------
    {
        "id": "detencao-arma-proibida",
        "category": "Armas",
        "category_id": "armas",
        "name": "Detenção de Arma Proibida",
        "article": "Artigo 86.º, n.º 1 da Lei n.º 5/2006 (RJAM)",
        "nature": "Público",
        "nature_desc": "CRIME PÚBLICO! Abrange a detenção, uso, porte, transporte de armas das classes A (armas brancas com lâmina > 10 cm com sistema de abertura rápida/mola ou borboleta, soqueiras/boxers, matracas, bastões extensíveis, aerossóis de gás pimenta não homologados, tasers/armas elétricas não policiais, armas de fogo com cano serrado ou sem número de série).",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Desarmar o indivíduo de imediato e garantir a segurança física dos agentes e terceiros.",
            "Desmuniciar a arma de fogo imediatamente com o cano apontado para local seguro e travar o mecanismo.",
            "Em caso de facas/armas brancas: medir a lâmina com fita métrica aferida desde o gume até ao cabo e verificar se tem travão/mola (faca de abertura automática ou borboleta).",
            "Declarar a voz de DETENÇÃO IMEDIATA por crime de detenção de arma proibida.",
            "Algemar o suspeito e efetuar revista de segurança aprofundada para verificar se possui mais armas ou munições.",
            "Conduzir o detido ao Posto/Esquadra, constituir arguido e aplicar TIR.",
            "Apreender formalmente a arma e as munições."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção em Flagrante Delito",
            "Auto de Exame Direto e Medição da Arma (comprimento total, comprimento da lâmina, calibre, marca, modelo, número de série)",
            "Registo Fotográfico da Arma junto a uma régua milimétrica",
            "Auto de Apreensão da Arma e Munições (art. 178.º CPP)",
            "Auto de Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Comunicação ao Ministério Público e remessa para Processo Sumário ou 1.º Interrogatório Judicial"
        ],
        "critical_notes": [
            "ARMAS BRANCAS PROIBIDAS DA CLASSE A: Navalhas com sistema de travão de lâmina de comprimento superior a 10 cm; Facas borboleta (butterfly); Facas de abertura automática / ponta-e-mola; Soqueiras (boxers); Bastões extensíveis de metal; Sprays de defesa pessoal não homologados pela PSP ou sem concentração legal de OC.",
            "As armas apreendidas pertencentes à classe A revertem a favor do Estado."
        ]
    },
    {
        "id": "detencao-ilegal-arma",
        "category": "Armas",
        "category_id": "armas",
        "name": "Detenção Ilegal de Arma / Sem Manifesto",
        "article": "Artigo 86.º da Lei n.º 5/2006 (RJAM)",
        "nature": "Público",
        "nature_desc": "Crime público para quem detém, usa ou transporta armas de fogo das classes B, B1, C, D ou E sem a respetiva licença de uso e porte de arma (LUPA) válida ou sem registo/manifesto no Sistema Integrado de Gestão de Armas (SIGA da PSP).",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Fiscalizar o cidadão e exigir a apresentação da Licença de Uso e Porte de Arma (LUPA), Livrete de Manifesto da Arma e Guia de Transporte/Seguro.",
            "Consultar o sistema SIGA para confirmar a autenticidade dos dados.",
            "Caso não possua licença ou o livrete não pertença ao portador: deter de imediato.",
            "Desmuniciar a arma em condições de segurança e acondicioná-la em estojo/embalagem lacrada.",
            "Constituir arguido, aplicar TIR e comunicar ao Ministério Público."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão da Arma de Fogo e Munições",
            "Auto de Exame Balístico Sumário e Identificação Cadastral da Arma (marca, modelo, calibre, n.º de série)",
            "Certidão ou comprovativo de consulta ao SIGA / Departamento de Armas e Explosivos da PSP",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)"
        ],
        "critical_notes": [
            "Atenção ao transporte: mesmo quem tem licença válida de caça (Classe D) ou tiro desportivo, se transportar a arma municiada, destravada ou fora do estojo/cadeado no porta-bagagens da viatura, comete ilícito!"
        ]
    },
    {
        "id": "trafico-armas",
        "category": "Armas",
        "category_id": "armas",
        "name": "Tráfico e Mediação de Armas",
        "article": "Artigo 87.º da Lei n.º 5/2006 (RJAM)",
        "nature": "Público",
        "nature_desc": "Crime público muito grave e de competência de investigação partilhada com a PJ.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Intercetar os suspeitos envolvidos na transação ilícita de armas ou munições.",
            "Apreender com máximas medidas de segurança o armamento, munições e valores monetários associados.",
            "Isolar o local e comunicar à Polícia Judiciária / NIC.",
            "Deter os intervenientes."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão exaustivo de armamento, carregadores e munições",
            "Constituição de Arguido e TIR",
            "Comunicação imediata à PJ e MP"
        ],
        "critical_notes": [
            "A transformação de armas de alarme ou de salva em armas de tiro real enquadra-se no crime de tráfico e transformação de armas proibidas."
        ]
    },

    # -------------------------------------------------------------
    # 8. CRIMES INFORMÁTICOS (Lei 109/2009 e CP)
    # -------------------------------------------------------------
    {
        "id": "burla-informatica",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Burla Informática e nas Telecomunicações",
        "article": "Artigo 221.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se valor elevado ou consideravelmente elevado",
        "nature_desc": "Carece de queixa do ofendido, salvo se o prejuízo for superior a 50 UC (art. 221.º n.º 5 CP).",
        "detention": "Em flagrante delito caso o agente seja apanhado a levantar fundos resultantes do esquema em caixas multibanco (money mule / mula de dinheiro).",
        "steps": [
            "Apurar a modalidade informática do esquema (ex: MB WAY falso no OLX, 'Olá pai/olá mãe' por WhatsApp, fishing bancário com SMS falsa, acesso fraudulento a credenciais de homebanking).",
            "Recolher de imediato com a vítima todos os dados técnicos: IBAN de destino, números de telemóvel utilizados, comprovativos de envio de dinheiro, capturas de ecrã completas com números e horas.",
            "Notificar a vítima para contactar de urgência o seu banco para bloqueio e estorno de fundos se viável.",
            "Tomar declarações detalhadas à vítima com manifestação expressa de queixa-crime."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa do Ofendido",
            "Juntada de Suportes Digitais (prints das conversas de WhatsApp, SMS fraudulentas, links falsos)",
            "Comprovativos Bancários e de Operações Multibanco / MB WAY com IBAN/identificadores",
            "Notificação do Estatuto e Direitos da Vítima (art. 67.º-A CPP)",
            "Ofício de envio urgente ao Ministério Público (Gabinete Cibercrime / DIAP)"
        ],
        "critical_notes": [
            "Preservação rápida: as transações digitais movem-se em minutos entre contas 'mulas'. O envio célere dos dados ao DIAP permite a emissão de ordens judiciais de apreensão de saldos bancários."
        ]
    },
    {
        "id": "acesso-ilegitimo",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Acesso Ilegítimo (Hacking)",
        "article": "Artigo 6.º da Lei n.º 109/2009 (Lei do Cibercrime)",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do titular do sistema ou dados no prazo de 6 meses (art. 115.º CP).",
        "detention": "Raramente presencial. Se houver mandado ou flagrante delito em invasão de sistemas protegidos: detenção.",
        "steps": [
            "Registar a queixa do ofendido com descrição da conta/servidor violado (email, redes sociais, base de dados de empresa).",
            "Recolher os endereços de IP de acesso não autorizado, logs de servidor e emails de notificação de segurança recebidos pela vítima.",
            "Apreender suportes de registo de dados caso haja busca ao domicílio do suspeito.",
            "Remeter ao MP (Secção de Cibercrime)."
        ],
        "expediente_docs": [
            "Auto de Queixa com histórico técnico dos acessos indevidos",
            "Cópia dos logs de acesso e endereços de IP suspeitos",
            "Constituição de Arguido e TIR (quando identificado)",
            "Remessa ao DIAP"
        ],
        "critical_notes": [
            "Se o acesso ilegítimo for a sistemas de infraestruturas críticas (hospitais, redes elétricas, banca, governo), passa a PÚBLICO e competência da Polícia Judiciária (UNC3T)."
        ]
    },
    {
        "id": "furto-uso-credenciais",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Furto ou Uso Ilícito de Credenciais e Phishing",
        "article": "Artigos 6.º e 10.º da Lei do Cibercrime e Artigo 221.º CP",
        "nature": "Semipúblico / Público",
        "nature_desc": "A obtenção ilegítima de passwords, códigos de segurança bancária ou credenciais de identidade digital.",
        "detention": "Em flagrante delito caso aplicável.",
        "steps": [
            "Registar o método de captura das credenciais (páginas falsas de bancos/entidades públicas, chamadas de vishing com falsa central de segurança).",
            "Juntar o histórico completo de comprovativos e extratos bancários.",
            "Ouvir a vítima e formalizar o expediente."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Queixa",
            "Juntada de comprovativos e prints do esquema de phishing",
            "Comunicação ao Ministério Público"
        ],
        "critical_notes": [
            "Aconselhar a vítima a alterar de imediato todas as passwords a partir de outro dispositivo seguro e revogar autorizações bancárias."
        ]
    }
]

output_path = "/home/marco/Transferências/Antigravity/guia-policial-app/expedientes.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Sucesso! Gerados {len(data)} procedimentos policiais completos em {output_path}")

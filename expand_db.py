#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate the complete Portuguese Police Expediente (SOP) database
for GNR / PSP field operations covering all crimes from the reference document.
"""
import json

existing_items = json.load(open("/home/marco/Transferências/Antigravity/guia-policial-app/expedientes.json", "r", encoding="utf-8"))

additional_items = [
    # Crimes Sexuais restantes
    {
        "id": "abuso-sexual-menores-dependentes",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Abuso Sexual de Menores Dependentes",
        "article": "Artigo 172.º do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público praticado por ascendente, tutor, adotante, ou quem tenha a guarda, educação, tratamento ou vigilância do menor.",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Garantir a proteção imediata do menor e afastá-lo do agressor com quem coabita.",
            "Comunicação imediata à Polícia Judiciária (competência reservada) e ao MP / CPCJ.",
            "Não submeter a criança a interrogatórios repetitivos pelo OPC (aplicável regime de declarações para memória futura com apoio psicológico).",
            "Deter o suspeito caso intercetado em flagrante.",
            "Apreender equipamentos e telemóveis do suspeito."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar / Detenção",
            "Comunicação Imediata à PJ e ao MP (Secção de Família e Menores)",
            "Comunicação à CPCJ em regime de urgência",
            "Ficha de Vítima Menor e Estatuto de Vítima",
            "Termo de Entrega à PJ"
        ],
        "critical_notes": [
            "Proteger estritamente a identidade e integridade do menor. Notificar de imediato o MP de turno para aplicação de medidas tutelares ou de acolhimento de emergência."
        ]
    },
    {
        "id": "atos-sexuais-adolescentes",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Atos Sexuais com Adolescentes",
        "article": "Artigo 173.º do Código Penal",
        "nature": "Semipúblico (regra) / Público conforme as circunstâncias",
        "nature_desc": "Carece de queixa do jovem ou seus representantes legais, salvo quando a queixa for suprida pelo Ministério Público em favor do interesse do menor.",
        "detention": "Detenção em flagrante delito se verificados os pressupostos gerais.",
        "steps": [
            "Apurar as idades exatas da vítima (14 a 16 anos) e do suspeito, e se há abuso de autoridade, dependência hierárquica ou remuneração.",
            "Ouvir os representantes legais e colher a sua posição processual.",
            "Comunicar à Polícia Judiciária e ao Ministério Público.",
            "Garantir assistência médica se necessário."
        ],
        "expediente_docs": [
            "Auto de Notícia / Denúncia",
            "Certidões de Nascimento / Comprovativos de idade",
            "Comunicação ao MP e à CPCJ",
            "Constituição de Arguido e TIR (se delegado)"
        ],
        "critical_notes": [
            "Diferença entre o art. 171.º (menos de 14 anos - sempre crime público de abuso de crianças) e art. 173.º (adolescentes entre 14 e 16 anos)."
        ]
    },
    {
        "id": "aliciamento-menores-fins-sexuais",
        "category": "Crimes Sexuais",
        "category_id": "sexuais",
        "name": "Aliciamento de Menores para Fins Sexuais (Cybergrooming)",
        "article": "Artigo 176.º-A do Código Penal",
        "nature": "Público",
        "nature_desc": "Crime público para quem propuser a menor de 16 anos a prática de atos sexuais ou encontros para esse fim, nomeadamente através da internet / redes sociais.",
        "detention": "Detenção em flagrante delito caso o suspeito se desloque ao local de encontro marcado com o menor.",
        "steps": [
            "Preservar todas as conversas digitais (WhatsApp, Instagram, Snapchat, Discord, jogos online): não apagar mensagens nem bloquear o perfil suspeito.",
            "Recolher cópias integrais dos registos, capturas de ecrã, números de contacto e perfis falsos utilizados.",
            "Se o suspeito marcar encontro com a vítima: planear dispositivo de interceção no local em articulação com a PJ / Ministério Público.",
            "Identificar e deter o suspeito no ato.",
            "Apreender de imediato telemóveis, tablets e viatura do indivíduo."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção / Denúncia",
            "Juntada de Suportes Digitais e Mensagens de Texto / Imagens trocadas",
            "Auto de Apreensão de Equipamentos Informáticos e Telefónicos",
            "Comunicação imediata à Polícia Judiciária e DIAP",
            "Constituição de Arguido e TIR"
        ],
        "critical_notes": [
            "Não apagar nada nas contas digitais do menor. Toda a cadeia de custódia digital deve ser preservada para análise pericial no LPC."
        ]
    },

    # Crimes Rodoviários restantes
    {
        "id": "homicidio-negligencia-transito",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Homicídio por Negligência no Trânsito",
        "article": "Artigo 137.º do Código Penal",
        "nature": "Semipúblico (regra) / Público se negligência grosseira",
        "nature_desc": "Carece de queixa da família/ofendidos salvo quando resultar de negligência grosseira (art. 137.º n.º 2 CP - ex: sob efeito de álcool, corrida ilegal ou desrespeito grave de passadeiras/semáforos), tornando-se PÚBLICO.",
        "detention": "Detenção facultativa/obrigatória em flagrante se negligência grosseira (ex: com TAS crime ou manobra com dolo eventual).",
        "steps": [
            "Socorro urgente e preservação do local com marcação das posições finais de viaturas, corpos e marcas de travagem.",
            "Submeter imediatamente TODOS os condutores intervenientes a teste de alcoolemia quantitativo e despistagem de estupefacientes.",
            "Acionar piquete de reconstituição de acidentes de viação (Núcleo de Investigação de Acidentes de Viação - NICAV / PAV).",
            "Isolar a via e recolher elementos técnicos: condições do piso, iluminação, sinalização, visibilidade, condições mecânicas dos veículos.",
            "Apreender as viaturas envolvidas à ordem do MP para exame pericial.",
            "Constituir o condutor como arguido e aplicar TIR se indícios de responsabilidade negligente."
        ],
        "expediente_docs": [
            "Auto de Acidente de Viação com Vítimas Mortais",
            "Auto de Notícia por Homicídio Negligente",
            "Croquis e Relatório Técnico de Sinistralidade Rodoviária (NICAV)",
            "Talões de Teste de Alcoolemia e Guias de Exame Toxicológico",
            "Auto de Apreensão das Viaturas Envolvidas",
            "Constituição de Arguido e Notificação de Direitos (art. 58.º e 61.º CPP)",
            "Termo de Identidade e Residência - TIR (art. 196.º CPP)",
            "Comunicação de Emergência ao Procurador de Turno do DIAP"
        ],
        "critical_notes": [
            "Qualquer condutor envolvido em acidente mortal DEVE ser submetido a teste de alcoolemia e drogas de imediato. Se hospitalizado, requerer colheita de sangue urgente nos termos do Código da Estrada."
        ]
    },
    {
        "id": "ofensa-negligencia-transito",
        "category": "Rodoviários",
        "category_id": "rodoviarios",
        "name": "Ofensa à Integridade Física por Negligência no Trânsito",
        "article": "Artigo 148.º do Código Penal",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do ofendido/ferido no prazo de 6 meses (art. 115.º CP).",
        "detention": "Geralmente não há detenção em flagrante, salvo se associado a outro crime que a justifique (ex: fuga, condução sob álcool TAS >= 1,20g/l ou sem carta).",
        "steps": [
            "Socorrer a vítima ferida e garantir o transporte hospitalar pelo INEM.",
            "Efetuar teste de álcool a todos os condutores intervenientes.",
            "Fazer o levantamento detalhado do croquis do acidente de viação.",
            "Notificar o ferido de que, querendo procedimento criminal pelo crime de ofensa à integridade física por negligência, tem de apresentar queixa formal no prazo de 6 meses.",
            "Identificar testemunhas presenciais."
        ],
        "expediente_docs": [
            "Participação de Acidente de Viação com Feridos",
            "Notificação do Direito de Queixa à Vítima (prazo de 6 meses)",
            "Talões de Alcoolemia dos intervenientes",
            "Croquis do Acidente de Viação",
            "Relatório preliminar de sinistro"
        ],
        "critical_notes": [
            "Se o condutor causador estiver com taxa de álcool >= 1,20 g/l: é DETIDO de imediato pelo crime do art. 292.º CP (que é público), independentemente da queixa do ferido."
        ]
    },

    # Drogas restantes
    {
        "id": "trafico-agravado",
        "category": "Drogas",
        "category_id": "drogas",
        "name": "Tráfico Agravado de Estupefacientes",
        "article": "Artigo 24.º do Decreto-Lei n.º 15/93",
        "nature": "Público",
        "nature_desc": "Crime público com agravação legal (ex: substâncias distribuídas a menores ou doentes mentais, em estabelecimentos prisionais, escolas ou hospitais; agente ser médico, farmacêutico ou agente das forças de segurança; organização criminosa).",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Deter os suspeitos e apreender o produto em perímetro escolar, prisional ou hospitalar.",
            "Verificar as circunstâncias qualificativas do artigo 24.º.",
            "Comunicação imediata à Polícia Judiciária e ao Ministério Público.",
            "Apreender telemóveis, listas de contactos, quantias monetárias e veículos.",
            "Preservar a cadeia de custódia e remeter amostras ao LPC."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Apreensão de Drogas e Valores",
            "Constituição de Arguido e TIR",
            "Comunicação ao MP para 1.º Interrogatório Judicial (Prisão Preventiva)"
        ],
        "critical_notes": [
            "Venda ou cedência de droga junto a escolas ou centros de estudo aciona de imediato a qualificação do art. 24.º alínea h)."
        ]
    },

    # Armas restantes
    {
        "id": "porte-arma-sob-alcool",
        "category": "Armas",
        "category_id": "armas",
        "name": "Porte de Arma sob Efeito do Álcool ou Estupefacientes",
        "article": "Artigo 86.º e 88.º da Lei n.º 5/2006 (RJAM)",
        "nature": "Público",
        "nature_desc": "Crime público para quem for detentor de arma de fogo ou branca e se encontre sob a influência de álcool (TAS igual ou superior a 1,20 g/l) ou substâncias psicotrópicas.",
        "detention": "DETENÇÃO OBRIGATÓRIA EM FLAGRANTE DELITO (art. 255.º CPP).",
        "steps": [
            "Desarmar o cidadão com máximas condições de segurança e desmuniciar a arma.",
            "Submeter a teste de ar expirado em alcoolímetro quantitativo homologado.",
            "Se TAS deduzida >= 1,20 g/l: dar voz de detenção imediata.",
            "Apreender cautelarmente a arma de fogo, munições, LUPA e livrete de manifesto.",
            "Conduzir o detido ao Posto/Esquadra, constituir arguido e aplicar TIR.",
            "Remeter expediente ao MP para cassação imediata da licença de uso e porte de arma (LUPA)."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Talão do Alcoolímetro Quantitativo",
            "Auto de Apreensão da Arma, Carregadores, Munições e Livrete",
            "Constituição de Arguido e TIR (art. 58.º e 196.º CPP)",
            "Comunicação de Medida Cautelar de Suspensão de LUPA à PSP / DAE"
        ],
        "critical_notes": [
            "Se a TAS for entre 0,50 g/l e 1,19 g/l: constitui contraordenação muito grave do RJAM com apreensão cautelar obrigatória da arma e munições."
        ]
    },
    {
        "id": "detencao-municoes-proibidas",
        "category": "Armas",
        "category_id": "armas",
        "name": "Detenção Ilegal de Munições Proibidas",
        "article": "Artigo 86.º da Lei n.º 5/2006 (RJAM)",
        "nature": "Público",
        "nature_desc": "Crime público para quem detiver munições perfurantes, explosivas, incendiárias, com projéteis expansivos não permitidos, ou calibres de guerra/militares (ex: 5.56x45mm NATO, 7.62x51mm NATO, 9x19mm sem manifesto).",
        "detention": "Detenção obrigatória em flagrante delito.",
        "steps": [
            "Apreender as munições e contar o número exato de cartuchos.",
            "Registar o calibre, marcas no culote e tipo de projétil (blindado, expansivo, incendiário, perfurante).",
            "Deter o portador e conduzir à subunidade.",
            "Constituir arguido e aplicar TIR."
        ],
        "expediente_docs": [
            "Auto de Notícia por Detenção",
            "Auto de Exame e Contagem de Munições com Registo Fotográfico",
            "Auto de Apreensão",
            "Constituição de Arguido e TIR"
        ],
        "critical_notes": [
            "A posse isolada de munições de armas de fogo sem possuir a arma ou manifesto válido constitui crime punível pela Lei das Armas."
        ]
    },

    # Informáticos restantes
    {
        "id": "intercecao-ilegitima",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Interceção Ilegítima de Comunicações",
        "article": "Artigo 7.º da Lei n.º 109/2009 (Lei do Cibercrime)",
        "nature": "Semipúblico",
        "nature_desc": "Carece de queixa do ofendido no prazo de 6 meses (escutas não autorizadas, interceção de transmissões Wi-Fi, programas espiões instalados no telemóvel da vítima).",
        "detention": "Flagrante delito se intercetado a instalar dispositivo clandestino ou spyware.",
        "steps": [
            "Recolher o telemóvel ou computador onde foram detetados programas de vigilância oculta (stalkerware / spy apps).",
            "Registar declarações do ofendido.",
            "Apreender o equipamento do suspeito se intercetado.",
            "Remeter ao MP."
        ],
        "expediente_docs": [
            "Auto de Queixa / Denúncia",
            "Auto de Apreensão de Dispositivos",
            "Constituição de Arguido e TIR"
        ],
        "critical_notes": [
            "Instalar programas no telemóvel do cônjuge/namorada para espiar conversas de WhatsApp sem consentimento integra este crime e/ou violência doméstica."
        ]
    },
    {
        "id": "dano-informatico",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Dano e Sabotagem Informática",
        "article": "Artigos 8.º e 9.º da Lei n.º 109/2009",
        "nature": "Semipúblico (Dano) / Público (Sabotagem)",
        "nature_desc": "Dano informático (apagar, danificar ou inutilizar dados/programas de outrem) carece de queixa; Sabotagem informática (paralisar sistemas de empresas, hospitais ou Estado) é crime PÚBLICO de competência da PJ.",
        "detention": "Detenção em flagrante delito se apanhado em flagrante.",
        "steps": [
            "Identificar o sistema atacado (ex: ataque de ransomware com bloqueio de dados de empresa).",
            "Proibir qualquer tentativa de recuperação amadora ou reinício de servidores que apague logs da memória RAM.",
            "Isolar os cabos de rede (desconectar da internet) mantendo os computadores ligados se possível.",
            "Comunicar de emergência à PJ (UNC3T - Unidade Nacional de Combate ao Cibercrime) e ao MP."
        ],
        "expediente_docs": [
            "Auto de Notícia Cautelar",
            "Registo de Comunicação Imediata à Polícia Judiciária",
            "Auto de Apreensão e Preservação de Dispositivos"
        ],
        "critical_notes": [
            "Ataques de ransomware a empresas com paralisação da atividade integram Sabotagem Informática e Extorsão."
        ]
    },
    {
        "id": "extorsao-informatica",
        "category": "Informáticos",
        "category_id": "informaticos",
        "name": "Extorsão Informática (Sextortion / Resgate Digital)",
        "article": "Artigo 223.º do Código Penal e Lei do Cibercrime",
        "nature": "Público",
        "nature_desc": "Crime público para quem constranger outrem, mediante ameaça de divulgação de fotos íntimas ou de destruição de ficheiros, a pagar quantia em dinheiro ou criptomoedas.",
        "detention": "Em flagrante delito caso haja entrega física de valores ou interceção bancária imediata.",
        "steps": [
            "Acalmar a vítima e instruí-la a NUNCA pagar o resgate exigido (o pagamento nunca garante que as fotos não sejam partilhadas).",
            "Recolher as capturas de ecrã completas das chantagens e perfis utilizados pelo extorquidor.",
            "Recolher dados bancários, contas de criptomoedas (endereço de carteira Bitcoin) ou referências de pagamento fornecidas.",
            "Tomar declarações detalhadas e remeter com urgência ao MP."
        ],
        "expediente_docs": [
            "Auto de Denúncia / Notícia",
            "Juntada de Suportes Digitais (áudios, mensagens de chantagem, emails de ameaça)",
            "Estatuto da Vítima",
            "Comunicação ao DIAP"
        ],
        "critical_notes": [
            "Sextortion (ameaça de divulgar vídeos íntimos nas redes sociais da vítima ou a familiares) é um dos crimes cibernéticos com maior impacto psicológico na vítima. Requer atendimento com máxima sensibilidade e sigilo."
        ]
    }
]

# Merge and avoid duplicate IDs
existing_ids = {x["id"] for x in existing_items}
final_items = list(existing_items)

for item in additional_items:
    if item["id"] not in existing_ids:
        final_items.append(item)
        existing_ids.add(item["id"])

output_path = "/home/marco/Transferências/Antigravity/guia-policial-app/expedientes.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(final_items, f, ensure_ascii=False, indent=2)

print(f"Total de procedimentos atualizado: {len(final_items)} procedimentos policiais salvos com sucesso!")

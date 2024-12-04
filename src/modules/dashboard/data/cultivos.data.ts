export const cultivosData = {
  "culturas": {
    "soja": {
      "clima": {
        "temperatura": {
          "ideal": "20°C a 30°C",
          "minima": "Abaixo de 10°C afeta germinação",
          "maxima": "Acima de 35°C pode provocar abortamento floral"
        },
        "chuvas": {
          "necessidade": "450 a 800 mm bem distribuídos durante o ciclo",
          "criticos": "Floração e enchimento de grãos são as fases mais sensíveis à falta de água"
        }
      },
      "solo": {
        "tipo": "Solos profundos, com boa drenagem e alta fertilidade natural",
        "textura": "Franco-argilosa ou argilosa",
        "ph": {
          "ideal": "5.8 a 6.5",
          "correcao": "Calagem deve ser realizada com 3 a 6 meses de antecedência ao plantio"
        },
        "nutrientes": {
          "essenciais": "Fósforo (P), potássio (K) e nitrogênio (N)",
          "quantidade_por_he": "Fósforo: 80-120 kg/ha, Potássio: 40-80 kg/ha, Nitrogênio: 20-30 kg/ha (principalmente para áreas não inoculadas)",
          "manejo": "Realizar adubação de base e cobertura conforme análise de solo",
          "adubo_recomendado": "Formulação NPK 4-20-20 na semeadura e uréia em cobertura na fase vegetativa"
        }
      },
      "irrigacao": {
        "qtd_por_he": "5.000 a 7.000 litros/ha por dia",
        "periodicidade": "A cada 2 a 3 dias em períodos sem chuva",
        "tecnologia": "Pivô central ou gotejamento para maior eficiência"
      },
      "manejo_pragas_doencas": {
        "pragas": [
          "Lagarta-da-soja",
          "Percevejo-marrom",
          "Lagarta-falsa-medideira"
        ],
        "doencas": [
          "Ferrugem-asiática",
          "Mancha-alvo",
          "Oídio"
        ],
        "controle": {
          "pragas": {
            "produto_recomendado": "Lambda-cialotrina (p.ex., Karate Zeon) ou clorpirifós",
            "dosagem": "300 a 500 mL/ha",
            "frequencia": "A cada 15 dias ou conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Triazóis (tebuconazol) ou estrobilurinas (azoxistrobina)",
            "dosagem": "250 a 400 mL/ha",
            "frequencia": "Prevenção a partir do florescimento, reaplicar a cada 15 dias"
          }
        }
      }
    },
    "milho": {
      "clima": {
        "temperatura": {
          "ideal": "21°C a 27°C",
          "minima": "Abaixo de 10°C afeta a germinação",
          "maxima": "Acima de 34°C prejudica a formação de grãos"
        },
        "chuvas": {
          "necessidade": "500 a 800 mm durante o ciclo",
          "criticos": "Florescimento e enchimento de grãos são os períodos mais sensíveis"
        }
      },
      "solo": {
        "tipo": "Solos bem drenados e férteis",
        "textura": "Franco-argilosa",
        "ph": {
          "ideal": "5.5 a 7.0",
          "correcao": "Aplicação de calcário se pH for inferior a 5.5"
        },
        "nutrientes": {
          "essenciais": "Nitrogênio (N), fósforo (P) e potássio (K)",
          "quantidade_por_he": "Nitrogênio: 100-120 kg/ha, Fósforo: 60-80 kg/ha, Potássio: 40-60 kg/ha",
          "manejo": "Adubação em cobertura com nitrogênio na fase de V6",
          "adubo_recomendado": "NPK 10-28-20 na semeadura e ureia em cobertura"
        }
      },
      "irrigacao": {
        "qtd_por_he": "7.000 a 9.000 litros/ha por dia",
        "periodicidade": "A cada 3 dias durante o florescimento e enchimento de grãos"
      },
      "manejo_pragas_doencas": {
        "pragas": [
          "Lagarta-do-cartucho",
          "Cigarrinha-do-milho",
          "Broca-da-cana"
        ],
        "doencas": [
          "Mancha-branca",
          "Ferrugem",
          "Podridão-de-colmo"
        ],
        "controle": {
          "pragas": {
            "produto_recomendado": "Espinosade (Tracer) ou Clorpirifós",
            "dosagem": "200 a 300 mL/ha",
            "frequencia": "A cada 15 dias ou conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Fungicidas à base de Mancozeb ou Tebuconazol",
            "dosagem": "250 a 500 mL/ha",
            "frequencia": "A cada 15 dias no período crítico (florescimento)"
          }
        }
      }
    },
    "feijao": {
      "clima": {
        "temperatura": {
          "ideal": "18°C a 28°C",
          "minima": "Abaixo de 15°C afeta germinação",
          "maxima": "Acima de 35°C prejudica o florescimento"
        },
        "chuvas": {
          "necessidade": "300 a 600 mm bem distribuídos",
          "criticos": "Floração e enchimento de vagens são as fases mais sensíveis"
        }
      },
      "solo": {
        "tipo": "Bem drenado, com boa aeração e alta fertilidade",
        "textura": "Franco-argilosa",
        "ph": {
          "ideal": "5.8 a 6.5",
          "correcao": "Calagem deve ser feita com antecedência"
        },
        "nutrientes": {
          "essenciais": "Fósforo (P), potássio (K) e matéria orgânica",
          "quantidade_por_he": "Fósforo: 60-120 kg/ha, Potássio: 30-50 kg/ha, Nitrogênio: 20-40 kg/ha",
          "manejo": "Adubação inicial e cobertura com nitrogênio em áreas não inoculadas",
          "adubo_recomendado": "NPK 4-30-16 na semeadura"
        }
      },
      "irrigacao": {
        "qtd_por_he": "3.000 a 5.000 litros/ha por dia",
        "periodicidade": "A cada 2 a 3 dias em períodos críticos",
        "tecnologia": "Gotejamento ou aspersão"
      },
      "manejo_pragas_doencas": {
        "pragas": [
          "Mosca-branca",
          "Vaquinha",
          "Lagarta-do-podrão"
        ],
        "doencas": [
          "Antracnose",
          "Míldio",
          "Mancha-angular"
        ],
        "controle": {
          "pragas": {
            "produto_recomendado": "Imidacloprido ou Tiametoxam",
            "dosagem": "200 a 300 mL/ha",
            "frequencia": "A cada 10-15 dias"
          },
          "doencas": {
            "produto_recomendado": "Fungicidas à base de Mancozeb ou Oxicloreto de cobre",
            "dosagem": "250 a 400 mL/ha",
            "frequencia": "A cada 15 dias durante o período crítico"
          }
        }
      }
    }
  }
};

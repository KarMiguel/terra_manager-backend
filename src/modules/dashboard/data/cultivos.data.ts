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
    },
    "algodao": {
    "clima": {
      "temperatura": {
        "ideal": "20°C a 30°C",
        "minima": "Abaixo de 15°C prejudica germinação",
        "maxima": "Acima de 35°C reduz retenção de maçãs"
      },
      "chuvas": {
        "necessidade": "500 a 1.200 mm durante o ciclo",
        "criticos": "Florescimento e formação de capulhos são fases mais sensíveis"
      }
    },
    "solo": {
      "tipo": "Profundo, bem drenado e fértil",
      "textura": "Franco-argilosa a argilosa",
      "ph": {
        "ideal": "5.5 a 6.5",
        "correcao": "Calagem conforme análise de solo"
      },
      "nutrientes": {
        "essenciais": "Nitrogênio (N), fósforo (P), potássio (K) e boro (B)",
        "quantidade_por_he": "Nitrogênio: 80-150 kg/ha, Fósforo: 60-120 kg/ha, Potássio: 60-120 kg/ha",
        "manejo": "Adubação parcelada, principalmente nitrogênio",
        "adubo_recomendado": "NPK 8-28-16 na base e ureia em cobertura"
      }
    },
    "irrigacao": {
      "qtd_por_he": "6.000 a 8.000 litros/ha por dia",
      "periodicidade": "A cada 3 dias em períodos secos"
    },
    "manejo_pragas_doencas": {
      "pragas": ["Bicudo-do-algodoeiro", "Pulgão", "Lagarta-rosada"],
      "doencas": ["Ramulária", "Murcha-de-fusarium"],
      "controle": {
        "pragas": {
          "produto_recomendado": "Lambda-cialotrina ou Imidacloprido",
          "dosagem": "300 mL/ha",
          "frequencia": "Conforme monitoramento"
        },
        "doencas": {
          "produto_recomendado": "Tebuconazol",
          "dosagem": "300 mL/ha",
          "frequencia": "A cada 15 dias em período úmido"
        }
      }
    }
    },
    "cafe": {
      "clima": {
        "temperatura": {
          "ideal": "18°C a 24°C",
          "minima": "Geadas podem causar perdas severas",
          "maxima": "Acima de 30°C reduz produtividade"
        },
        "chuvas": {
          "necessidade": "1.200 a 1.800 mm por ano",
          "criticos": "Florada e enchimento de grãos"
        }
      },
      "solo": {
        "tipo": "Profundo, bem drenado e rico em matéria orgânica",
        "textura": "Franco-argilosa",
        "ph": {
          "ideal": "5.5 a 6.5",
          "correcao": "Calagem e gessagem conforme análise"
        },
        "nutrientes": {
          "essenciais": "Nitrogênio, potássio e cálcio",
          "quantidade_por_he": "N: 150-300 kg/ha/ano",
          "manejo": "Adubação parcelada ao longo do ano",
          "adubo_recomendado": "NPK 20-05-20"
        }
      },
      "irrigacao": {
        "qtd_por_he": "Variável conforme fase produtiva",
        "periodicidade": "Suplementar na seca"
      },
      "manejo_pragas_doencas": {
        "pragas": ["Broca-do-café", "Bicho-mineiro"],
        "doencas": ["Ferrugem-do-cafeeiro", "Cercosporiose"],
        "controle": {
          "pragas": {
            "produto_recomendado": "Clorpirifós",
            "dosagem": "300 mL/ha",
            "frequencia": "Conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Azoxistrobina",
            "dosagem": "250 mL/ha",
            "frequencia": "Preventivo"
          }
        }
      }
    },
    "arroz": {
      "clima": {
        "temperatura": {
          "ideal": "20°C a 30°C",
          "minima": "Abaixo de 15°C afeta desenvolvimento",
          "maxima": "Acima de 35°C prejudica floração"
        },
        "chuvas": {
          "necessidade": "700 a 1.200 mm",
          "criticos": "Perfilhamento e floração"
        }
      },
      "solo": {
        "tipo": "Solos planos com boa retenção de água",
        "textura": "Argilosa",
        "ph": {
          "ideal": "5.5 a 6.5",
          "correcao": "Calagem se necessário"
        },
        "nutrientes": {
          "essenciais": "Nitrogênio, fósforo e potássio",
          "quantidade_por_he": "N: 90-120 kg/ha",
          "manejo": "Nitrogênio parcelado",
          "adubo_recomendado": "NPK 05-25-15"
        }
      },
      "irrigacao": {
        "qtd_por_he": "Lâmina contínua de 5 a 10 cm",
        "periodicidade": "Manter inundação controlada"
      },
      "manejo_pragas_doencas": {
        "pragas": ["Percevejo-do-arroz", "Lagarta-da-panícula"],
        "doencas": ["Brusone"],
        "controle": {
          "pragas": {
            "produto_recomendado": "Lambda-cialotrina",
            "dosagem": "250 mL/ha",
            "frequencia": "Conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Triazóis",
            "dosagem": "300 mL/ha",
            "frequencia": "Preventivo"
          }
        }
      }
    },
    "trigo": {
      "clima": {
        "temperatura": {
          "ideal": "15°C a 22°C",
          "minima": "Tolera frio moderado",
          "maxima": "Acima de 30°C reduz rendimento"
        },
        "chuvas": {
          "necessidade": "450 a 650 mm",
          "criticos": "Espigamento e enchimento de grãos"
        }
      },
      "solo": {
        "tipo": "Bem drenado e fértil",
        "textura": "Franco-argilosa",
        "ph": {
          "ideal": "5.5 a 6.5",
          "correcao": "Calagem conforme análise"
        },
        "nutrientes": {
          "essenciais": "Nitrogênio e fósforo",
          "quantidade_por_he": "N: 60-120 kg/ha",
          "manejo": "Cobertura no perfilhamento",
          "adubo_recomendado": "NPK 08-20-20"
        }
      },
      "irrigacao": {
        "qtd_por_he": "4.000 a 6.000 litros/ha por dia",
        "periodicidade": "Em períodos críticos"
      },
      "manejo_pragas_doencas": {
        "pragas": ["Pulgão-do-trigo"],
        "doencas": ["Ferrugem-da-folha", "Giberela"],
        "controle": {
          "pragas": {
            "produto_recomendado": "Imidacloprido",
            "dosagem": "200 mL/ha",
            "frequencia": "Conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Tebuconazol",
            "dosagem": "300 mL/ha",
            "frequencia": "No início da infecção"
          }
        }
      }
    },
    "cana_de_acucar": {
      "clima": {
        "temperatura": {
          "ideal": "20°C a 32°C",
          "minima": "Abaixo de 15°C reduz crescimento",
          "maxima": "Acima de 38°C causa estresse hídrico"
        },
        "chuvas": {
          "necessidade": "1.000 a 1.500 mm por ano",
          "criticos": "Perfilhamento"
        }
      },
      "solo": {
        "tipo": "Profundo e fértil",
        "textura": "Franco-argilosa",
        "ph": {
          "ideal": "5.5 a 6.5",
          "correcao": "Calagem e gessagem se necessário"
        },
        "nutrientes": {
          "essenciais": "Nitrogênio e potássio",
          "quantidade_por_he": "N: 100 kg/ha, K: 120 kg/ha",
          "manejo": "Adubação após corte",
          "adubo_recomendado": "NPK 20-05-20"
        }
      },
      "irrigacao": {
        "qtd_por_he": "8.000 litros/ha por dia",
        "periodicidade": "Suplementar na seca"
      },
      "manejo_pragas_doencas": {
        "pragas": ["Broca-da-cana"],
        "doencas": ["Ferrugem-alaranjada"],
        "controle": {
          "pragas": {
            "produto_recomendado": "Clorpirifós",
            "dosagem": "400 mL/ha",
            "frequencia": "Conforme monitoramento"
          },
          "doencas": {
            "produto_recomendado": "Triazóis",
            "dosagem": "300 mL/ha",
            "frequencia": "Preventivo"
          }
        }
      }
    }
  }
};

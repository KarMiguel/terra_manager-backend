import { PrismaClient, TipoPlanoEnum } from '@prisma/client';

const prisma = new PrismaClient();

const planos = [
  { 
    nome: 'Plano Básico',
    tipoPlano: TipoPlanoEnum.BASICO,
    tempoPlanoDias: 90,
    valorPlano: 397.90,
    descricao: 'Recursos essenciais para gestão da propriedade rural.',
    ativo: true,
  },
  {
    nome: 'Plano Pro',
    tipoPlano: TipoPlanoEnum.PRO,
    tempoPlanoDias: 180,
    valorPlano: 699.90,
    descricao: 'Recursos avançados, relatórios e integrações.',
    ativo: true,
  },
  {
    nome: 'Plano Premium',
    tipoPlano: TipoPlanoEnum.PREMIUM,
    tempoPlanoDias: 365,
    valorPlano: 1197.90,
    descricao: 'Acesso completo, suporte prioritário e todas as funcionalidades.',
    ativo: true,
  },
];

async function main() {
  console.log('Iniciando seed de planos...');

  for (const p of planos) {
    const existing = await prisma.plano.findFirst({
      where: { tipoPlano: p.tipoPlano },
    });
    if (existing) {
      await prisma.plano.update({
        where: { id: existing.id },
        data: p,
      });
    } else {
      await prisma.plano.create({ data: p });
    }
  }

  console.log('Seed de planos concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

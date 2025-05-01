import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pragas = [
  {
    nomeCientifico: 'Spodoptera frugiperda',
    nomeComum: 'Lagarta-do-cartucho',
    descricao: 'Principal praga do milho, ataca as folhas e o cartucho da planta.',
  },
  {
    nomeCientifico: 'Helicoverpa armigera',
    nomeComum: 'Helicoverpa',
    descricao: 'Lagarta que ataca diversas culturas, incluindo soja, milho e algodão.',
  },
  {
    nomeCientifico: 'Bemisia tabaci',
    nomeComum: 'Mosca-branca',
    descricao: 'Inseto que suga a seiva das plantas e transmite vírus.',
  },
  {
    nomeCientifico: 'Diabrotica speciosa',
    nomeComum: 'Vaquinha',
    descricao: 'Besouro que ataca folhas e raízes de diversas culturas.',
  },
  {
    nomeCientifico: 'Nezara viridula',
    nomeComum: 'Percevejo-verde',
    descricao: 'Percevejo que suga os grãos e causa danos à qualidade da produção.',
  },
  {
    nomeCientifico: 'Euschistus heros',
    nomeComum: 'Percevejo-marrom',
    descricao: 'Percevejo que ataca principalmente a cultura da soja.',
  },
  {
    nomeCientifico: 'Anticarsia gemmatalis',
    nomeComum: 'Lagarta-da-soja',
    descricao: 'Principal praga desfolhadora da soja.',
  },
  {
    nomeCientifico: 'Diatraea saccharalis',
    nomeComum: 'Broca-da-cana',
    descricao: 'Principal praga da cana-de-açúcar.',
  },
  {
    nomeCientifico: 'Aphis gossypii',
    nomeComum: 'Pulgão-do-algodoeiro',
    descricao: 'Praga que suga a seiva e transmite vírus para o algodão.',
  },
  {
    nomeCientifico: 'Anthonomus grandis',
    nomeComum: 'Bicudo-do-algodoeiro',
    descricao: 'Principal praga do algodão, ataca os botões florais.',
  }
];

async function main() {
  console.log('Iniciando seed de pragas...');
  
  for (const praga of pragas) {
    await prisma.praga.create({
      data: praga,
    });
  }
  
  console.log('Seed de pragas concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
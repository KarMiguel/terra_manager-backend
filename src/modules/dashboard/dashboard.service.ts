import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { cultivosData } from './data/cultivos.data';

@Injectable()
export class DashboardService {

  constructor(private readonly configService: ConfigService) {
  }
  
  private cultivos = cultivosData.culturas;

  static readonly TiposDasCulturasEnum: {
    [key: string]: string;
  } = {
    soja: "SOJA",
    milho: "MILHO",
    feijao: "FEIJAO",
    algodao: "ALGODAO",
    cafe: "CAFE",
    arroz: "ARROZ",
    trigo: "TRIGO",
    "cana-de-acucar": "CANA-DE-ACUCAR"
  };
  async getCultivoByName(nome: string) {
    const cultivo = this.cultivos[nome.toLowerCase()];
    if (!cultivo) {
      throw new HttpException(
        `Cultura "${nome}" não encontrada.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return cultivo;
  }

  async getWeatherByCity(city: string, state?: string, country: string = 'BR') {
    try {
      const apiClimaUrl = this.configService.get<string>('API_CLIMA_URL');
      const apiClimaKey = this.configService.get<string>('API_CLIMA_KEY');
  
      const query = [city, state, country].filter(Boolean).join(',');
      const url = `${apiClimaUrl}?q=${encodeURIComponent(query)}&appid=${apiClimaKey}&units=metric&lang=pt_br`;
  
      console.log(`Fetching weather data with URL: ${url}`);
  
      const response = await axios.get(url);
      const { main, weather, wind, name, coord } = response.data;
  
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        query
      )}&appid=${apiClimaKey}&units=metric&lang=pt_br`;
  
      const forecastResponse = await axios.get(forecastUrl);
      const { list } = forecastResponse.data;
  
      const previsaoProximosDias = Object.values(
        list.reduce((acc: any, entry: any) => {
          const date = new Date(entry.dt * 1000).toISOString().split('T')[0]; 
          if (!acc[date]) {
            acc[date] = {
              data: date,
              temperaturaMin: entry.main.temp_min,
              temperaturaMax: entry.main.temp_max,
              condicao: entry.weather[0]?.description || 'N/A',
              vento: `${entry.wind.speed} m/s`,
              humidade: entry.main.humidity,
            };
          }
          return acc;
        }, {})
      );
  
      return {
        cidade: `${name} - ${state} - ${country}`,
        condicaoAtual: weather[0]?.description || 'N/A',
        previsaoProximosDias,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Erro ao buscar dados do clima.',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Erro interno ao buscar dados do clima.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  async getCommodityPrice(symbol = 'SOJA') {
    try {
      const apiUrlCotacao = this.configService.get<string>('API_COTACAO_URL');
      const tokenCotacao = this.configService.get<string>('API_COTACAO_TOKEN');

      const url = `${apiUrlCotacao}/${encodeURIComponent(symbol)}?token=${tokenCotacao}`;
      const response = await axios.get(url);

      const resultado = response.data?.results?.[0];
      if (!resultado) {
        throw new HttpException('Dados da commodity não encontrados', HttpStatus.NOT_FOUND);
      }

      return {
        nome: resultado.longName || resultado.shortName || 'Não Encontrado',
        simbolo: resultado.symbol,
        precoAtual: resultado.regularMarketPrice,
        precoPassado: resultado.regularMarketPreviousClose,
        precoFuturo: resultado.regularMarketDayHigh,
        prospecao: resultado.regularMarketChangePercent,
      };
    } catch (error) {
      console.error('Erro na API de cotação:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'Erro ao buscar cotação da commodity',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNewsByQuery(query: string, pageSize: number = 5) {
    try {
      if (!query) {
        throw new HttpException('O parâmetro "query" é obrigatório.', HttpStatus.BAD_REQUEST);
      }

      const apiNewsUrl = this.configService.get<string>('API_NEWS_URL');
      const newsApiKey = this.configService.get<string>('API_NEWS_KEY');

      let page = 1;
      let filteredArticles: any[] = [];
      const maxPages = 5;

      while (filteredArticles.length < pageSize && page <= maxPages) {
        const url = `${apiNewsUrl}?q=${encodeURIComponent(query)}&apiKey=${newsApiKey}&language=pt&page=${page}&pageSize=${pageSize}`;

        console.log(`Fetching news with URL: ${url}`);

        const response = await axios.get(url);

        if (!response.data || !response.data.articles) {
          console.warn('Nenhuma notícia encontrada na página:', page);
          break;
        }

        const articles = response.data.articles.filter(article =>
          article?.title !== "[Removed]" &&
          article?.description !== "[Removed]" &&
          article?.url !== "https://removed.com" &&
          article?.source?.name !== "[Removed]",
        );

        filteredArticles = filteredArticles.concat(articles);
        page++;
      }

      filteredArticles = filteredArticles.slice(0, pageSize);

      if (filteredArticles.length === 0) {
        throw new HttpException('Nenhuma notícia encontrada.', HttpStatus.NOT_FOUND);
      }

      return {
        totalResults: filteredArticles.length,
        articles: filteredArticles.map(article => ({
          titulo: article.title || 'Título não informado',
          descricao: article.description || 'Descrição não informada',
          url: article.url || 'URL não disponível',
          img: article.urlToImage || 'Imagem não disponível',
          fonte: article.source?.name || 'Fonte desconhecida',
          publicadoEm: article.publishedAt || 'Data não disponível',
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error.response?.data || error.message);

      throw new HttpException(
        'Erro ao buscar notícias. Por favor, tente novamente mais tarde.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    
  async getSoilSummaryData(
    lon: number,
    lat: number,
    properties: string[] = [
      'clay', 'sand', 'silt', 'bdod', 'cec', 'nitrogen',
      'phh2o', 'cfvo', 'ocd', 'ocs', 'soc'
    ]
  ) {
    try {
      const soilApiUrl = this.configService.get<string>('API_SOIL_URL');
      if (!soilApiUrl) {
        throw new Error('A variável de ambiente API_SOIL_URL não está configurada.');
      }
  
      const propertyQuery = properties.map((prop) => `property=${prop}`).join('&');
      const url = `${soilApiUrl}?lon=${lon}&lat=${lat}&${propertyQuery}`;
  
      console.log(`Buscando dados do solo de: ${url}`);
  
      const response = await axios.get(url);
      const { geometry, properties: apiProperties, query_time_s } = response.data;
  
      if (!geometry || !apiProperties || !apiProperties.layers) {
        throw new HttpException('Dados do solo não encontrados para a localização fornecida.', HttpStatus.NOT_FOUND);
      }
  
      // Processar camadas
      const layers = apiProperties.layers.filter((layer) =>
        properties.includes(layer.name)
      ).map((layer) => ({
        nome: layer.name,
        unidade: layer.unit_measure?.target_units || 'N/A',
        profundidades: layer.depths.map((depth) => ({
          faixa: depth.label || `${depth.range?.top_depth}-${depth.range?.bottom_depth} ${depth.range?.unit_depth || 'cm'}`,
          media: depth.values?.mean || 'N/A',
        })),
      }));
  
      // Construir resposta resumida
      return {
        localizacao: {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        },
        propriedades: layers,
        tempo_consulta_s: query_time_s,
      };
    } catch (error) {
      console.error('Erro ao buscar dados de solo:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'Erro ao buscar dados do solo.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}


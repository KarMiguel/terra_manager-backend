import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { format } from 'path';

@Injectable()
export class DashboardService {
  private readonly apiClimaKey = 'a57060b1d446779adeabafbd162e5f4f';
  private readonly apiClimaUrl = 'https://api.openweathermap.org/data/2.5/weather';

  async getWeatherByCity(cityName: string) {
    try {
      const url = `${this.apiClimaUrl}?q=${encodeURIComponent(
        cityName,
      )}&appid=${this.apiClimaKey}&units=metric&lang=pt_br`;

      const response = await axios.get(url);

      // Formatar os dados antes de retornar
      const {
        main: { temp, humidity },
        weather,
        wind: { speed },
        name,
      } = response.data;
      
      return {
        cidade: name,
        temperatura: temp,
        humidade: humidity,
        condicao: weather[0]?.description || 'N/A',
        vento: `${speed} m/s`,
        data: new Date()
      };
    } catch (error) {

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
  private readonly apiUrlCotacao = 'https://brapi.dev/api/quote';
  private readonly tokenCotacao = '4PR2z62mmaYrxCSCYCz9EL';

  async getCommodityPrice(symbol = 'SOJA') {
    try {
      const url = `${this.apiUrlCotacao}/${encodeURIComponent(symbol)}?token=${this.tokenCotacao}`;
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

  private readonly newsApiKey = 'd7bba934ec9545d98fbb26a9115172d6';
  private readonly newsApiUrl = 'https://newsapi.org/v2/everything';

  async getNewsByQuery(query: string, page: number = 1, pageSize: number = 10) {
    try {
      if (!query) {
        throw new HttpException('O parâmetro "query" é obrigatório.', HttpStatus.BAD_REQUEST);
      }

      const url = `${this.newsApiUrl}?q=${(query)}&apiKey=${this.newsApiKey}&language=pt&page=${page}&pageSize=${pageSize}`;

      console.log(`Fetching news with URL: ${url}`);

      const response = await axios.get(url);

      if (!response.data || !response.data.articles) {
        console.error('Resposta da API:', response.data);
        throw new HttpException('Nenhuma notícia encontrada.', HttpStatus.NOT_FOUND);
      }

      const { articles, totalResults } = response.data;

      if (articles.length === 0) {
        console.warn('Nenhuma notícia encontrada para a consulta:', query);
        throw new HttpException('Nenhuma notícia encontrada.', HttpStatus.NOT_FOUND);
      }

      return {
        totalResults,
        currentPage: page,
        pageSize,
        articles: articles.map((article: any) => ({
          titulo: article.title,
          descricao: article.description,
          url: article.url,
          fonte: article.source?.name || 'Fonte desconhecida',
          publicadoEm: article.publishedAt,
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data?.message || 'Erro ao buscar notícias.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { TalhaoService } from '../talhao/talhao.service';
import { ZonaManejoService } from '../zona-manejo/zona-manejo.service';

export interface MapaFazendaResponse {
  talhoes: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: Record<string, unknown>;
      properties: { id: number; nome: string; areaHa: number };
    }>;
  };
  zonasManejo: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: Record<string, unknown>;
      properties: { id: number; nome: string; tipo?: string; cor?: string; idTalhao?: number };
    }>;
  };
}

@Injectable()
export class MapaService {
  constructor(
    private readonly talhaoService: TalhaoService,
    private readonly zonaManejoService: ZonaManejoService,
  ) {}

  /**
   * Retorna talhões e zonas de manejo da fazenda em formato GeoJSON,
   * para exibição em um único mapa (camadas talhões + zonas).
   */
  async getMapaFazenda(idFazenda: number, idUsuario: number): Promise<MapaFazendaResponse> {
    const [talhoes, zonasManejo] = await Promise.all([
      this.talhaoService.mapaPorFazenda(idFazenda, idUsuario),
      this.zonaManejoService.mapaPorFazenda(idFazenda, idUsuario),
    ]);
    return { talhoes, zonasManejo };
  }
}

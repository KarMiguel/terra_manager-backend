import { AnaliseSoloModel, CalagemModel } from "../interface/analise-solo.interface";

export class CalculosUtil {
    // Eficiências médias de utilização do fertilizante (baseado em literatura técnica)
    public static readonly EFICIENCIA = {
        N: 0.5, // 50% - Nitrogênio
        P: 0.3, // 30% - Fósforo
        K: 0.6  // 60% - Potássio
    } as const;

    // Fator de conversão de mg/dm³ para kg/ha (0–20 cm; densidade 1 g/cm³)
    public static readonly FATOR_CONVERSAO = 2;

    /**
     * Calcula a dose de fertilizante (kg/ha) necessária para um nutriente.
     * @param soloMgDm3 Valor do nutriente disponível no solo (mg/dm³)
     * @param exigKgHa Exigência da cultura (kg/ha) para o nutriente
     * @param eficiencia Eficiência de utilização do fertilizante (fração 0-1)
     */
    public static calcDoseKgHa(
        soloMgDm3: number | null | undefined,
        exigKgHa: number,
        eficiencia: number,
    ): number {
        const soloMgDm3Value = soloMgDm3 ?? 0;

        // Converte mg/dm³ para kg/ha
        const soloKgHa = soloMgDm3Value * CalculosUtil.FATOR_CONVERSAO;

        // Necessidade adicional para atingir a exigência
        const necessidade = exigKgHa - soloKgHa;

        // Dose de manutenção (10 % da exigência) caso o solo já esteja suprido
        const manutencao = exigKgHa * 0.10;

        const doseAplicar = necessidade > 0 ? necessidade : manutencao;

        // Ajuste pela eficiência
        const doseKgHa = doseAplicar / eficiencia;

        return Number(doseKgHa.toFixed(2));
    }

    /**
     * Calcula calagem (RC e RCT) baseada nos parâmetros da análise de solo.
     */
    public static calcCalagem(analiseSolo: AnaliseSoloModel): CalagemModel {
        const { ctc, v, valorCultural, areaTotal, prnt } = analiseSolo;

        const rc = ctc * (valorCultural - v) / prnt;
        const rct = rc * areaTotal;

        return { rc, rct };
    }
}




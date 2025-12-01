import { UnidadeFator } from './unidade.interface';

export interface Produto {
  id: number;
  codigoProduto: number;
  descricaoProduto: string;
  estoque: number;
  unidades: UnidadeFator[];
  unidadeTexto?: string;
  fatorTexto?: string;
  dataCriacao: string | Date;
  historicoEstoque?: number[];
  historicoSaida?: number[];
}

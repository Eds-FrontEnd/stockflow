export interface Venda {
  id: number;
  vendedor: string;
  valor: number;
  dataCriacao: string | Date;
  comissao: number;
}

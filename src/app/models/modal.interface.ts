export interface ProdutoDialogData {
  id?: number;
  codigoProduto: number | null;
  descricaoProduto: string;
  estoque: number | null;
  unidades: { unidade: string; fator: number }[];
}

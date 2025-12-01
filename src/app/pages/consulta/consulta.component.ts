import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { ProdutoDialogData } from '../../models/modal.interface';
import { Produto } from '../../models/produto.interface';
import { ColumnTable } from './../../models/column.interface';

import { DateFormatPipe } from '../../shared/pipes/format-pipe/date-format.pipe';

import { ProdutoService } from '../../services/products.service';

import { DialogOverviewProductDialog } from './components/product-modal/product-modal.component';
import { TableProductComponent } from './components/product-table/product-table.component';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, TableProductComponent],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css'],
})
export class ConsultaComponent {
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dateFormatPipe = new DateFormatPipe();

  columns: ColumnTable[] = [
    { field: 'codigoProduto', header: 'Código Produto' },
    { field: 'descricaoProduto', header: 'Descrição' },
    { field: 'estoque', header: 'Estoque' },
    { field: 'unidadeTexto', header: 'Unidade' },
    { field: 'fatorTexto', header: 'Fator' },
    { field: 'dataCriacao', header: 'Data' },
  ];

  data: Produto[] = [];
  loading = true;

  dataSource = new MatTableDataSource<Produto>();

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.produtoService.carregarProdutos().subscribe({
      next: (produtos) => {
        this.data = produtos;
        this.dataSource.data = produtos;
        this.loading = false;
      },
      error: () => {
        console.warn('Erro ao carregar produtos.json');
        this.data = [];
        this.dataSource.data = [];
        this.loading = false;
      },
    });
  }

  onTableAction(event: { type: string; row: Produto }) {
    const produto = event.row;
    const currentDate = new Date().toISOString();

    if (event.type === 'estornar') {
      produto.descricaoProduto = `ESTORNO-${produto.codigoProduto}-${produto.descricaoProduto}`;
      produto.estoque -= produto.estoque;

      produto.dataCriacao = this.dateFormatPipe.transform(currentDate);
      const produtosAtualizados = JSON.parse(
        localStorage.getItem('produtos') || '[]'
      ) as Produto[];

      const index = produtosAtualizados.findIndex((p) => p.id === produto.id);
      if (index !== -1) {
        produtosAtualizados[index] = produto;
      }

      localStorage.setItem('produtos', JSON.stringify(produtosAtualizados));

      this.data = produtosAtualizados;
      this.dataSource.data = [...this.data];

      this.snackBar.open(`Produto estornado com sucesso.`, 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-success'],
      });
    } else if (event.type === 'saida') {
      const dialogRef = this.dialog.open(DialogOverviewProductDialog, {
        width: '500px',
        data: {
          id: produto.id,
          codigoProduto: produto.codigoProduto,
          descricaoProduto: produto.descricaoProduto,
          estoque: produto.estoque,
          unidades: produto.unidades || [{ unidade: '', fator: 1 }],
        } as ProdutoDialogData,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          result.descricaoProduto = `SAÍDA-${result.codigoProduto}-${result.descricaoProduto}`;
          const quantidadeSubtraida = result.estoque;

          produto.estoque -= quantidadeSubtraida;
          produto.descricaoProduto = result.descricaoProduto;

          produto.dataCriacao = this.dateFormatPipe.transform(currentDate);

          const produtosAtualizados = JSON.parse(
            localStorage.getItem('produtos') || '[]'
          ) as Produto[];

          const index = produtosAtualizados.findIndex(
            (p) => p.id === produto.id
          );
          if (index !== -1) {
            produtosAtualizados[index] = produto;
          }

          localStorage.setItem('produtos', JSON.stringify(produtosAtualizados));

          this.data = produtosAtualizados;
          this.dataSource.data = [...this.data];

          this.snackBar.open(`Produto atualizado com sucesso.`, 'X', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar-success'],
          });
        }
      });
    }
  }
}

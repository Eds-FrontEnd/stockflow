import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProdutoService } from '../../../../services/products.service';

import { ButtonComponent } from '../../../../components/button/button.component';
import { FilterComponent } from '../../../../components/filter/filter.component';
import { DialogOverviewProductDialog } from '../product-modal/product-modal.component';

import { TableActionsProducts } from './../../../../models/table-actions-products.interface';
import { ColumnTable } from './../../../../models/column.interface';
import { Produto } from './../../../../models/produto.interface';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
    FilterComponent,
    ButtonComponent,
  ],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.css'],
})
export class TableProductComponent implements AfterViewInit, OnChanges {
  @Input() columns: ColumnTable[] = [];
  @Input() data: Produto[] = [];
  @Input() showActions: boolean = false;
  @Input() actions: TableActionsProducts = { estornar: true, saida: true };
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() loading: boolean = false;

  @Output() action = new EventEmitter<{
    type: keyof TableActionsProducts;
    row: Produto;
  }>();

  dataSource = new MatTableDataSource<Produto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private produtoService = inject(ProdutoService);

  private searchValue = '';
  private rangeValue = '';

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyCustomFilter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.dataSource.data = this.data.map((d) =>
        this.atualizarEstoqueDinamico(d)
      );
    }
  }

  get displayedColumns(): string[] {
    const baseColumns = this.columns.map((col) => col.field);
    const hasActions =
      this.actions?.estornar === true || this.actions?.saida === true;

    return this.showActions && hasActions
      ? [...baseColumns, 'actions']
      : baseColumns;
  }

  private atualizarEstoqueDinamico(row: Produto): Produto {
    const historicoEstorno = row.historicoEstoque ?? [];
    const historicoSaida = row.historicoSaida ?? [];

    if (historicoEstorno.length > 0) {
      const ultimoEstorno = historicoEstorno[historicoEstorno.length - 1];
      return { ...row, estoque: ultimoEstorno };
    }

    if (historicoSaida.length > 0) {
      const ultimoSaida = historicoSaida[historicoSaida.length - 1];
      return { ...row, estoque: ultimoSaida };
    }

    return row;
  }

  onAction(type: keyof TableActionsProducts, row: Produto): void {
    let updatedRow = row;

    if (type === 'estornar') {
      const qtdAtual = Number(row.estoque);

      updatedRow = {
        ...row,
        estoque: 0,
        historicoEstoque: [
          ...(row.historicoEstoque ?? []),
          qtdAtual,
          -qtdAtual,
          0,
        ],
        historicoSaida: [...(row.historicoSaida ?? [])], // NÃO MUDA
      };
    }

    if (type === 'saida') {
      const quantidadeSaida = prompt('Digite a quantidade de saída:');

      if (quantidadeSaida !== null) {
        const valorSaida = Number(quantidadeSaida);
        const estoqueAtual = Number(row.estoque);

        if (isNaN(valorSaida) || valorSaida < 0) return;

        const novoEstoque = estoqueAtual - valorSaida;

        updatedRow = {
          ...row,
          historicoSaida: [
            ...(row.historicoSaida ?? []),
            estoqueAtual,
            -valorSaida,
            novoEstoque,
          ],
          estoque: novoEstoque,
        };
      }
    }

    updatedRow = this.atualizarEstoqueDinamico(updatedRow);

    this.action.emit({ type, row: updatedRow });
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchValue = value;
    this.emitFilter();
  }

  onRangeChange(event: { start?: string | null; end?: string | null }) {
    const startStr = event.start?.trim();
    const endStr = event.end?.trim();

    if (startStr && endStr) {
      const startTs = TableProductComponent.dateStrToTimestamp(startStr);
      const endTs = TableProductComponent.dateStrToTimestamp(endStr);
      this.rangeValue = `${startTs}|${endTs}`;
    } else {
      this.rangeValue = '';
    }

    this.emitFilter();
  }

  private emitFilter() {
    const filter = [this.searchValue, this.rangeValue]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.dataSource.filter = filter;
  }

  private applyCustomFilter() {
    this.dataSource.filterPredicate = (item: Produto, filter: string) => {
      const parts = filter.split(' ');

      const search = parts.find((p) => !p.includes('|')) || '';
      const matchesSearch = search
        ? JSON.stringify(item).toLowerCase().includes(search)
        : true;

      const range = parts.find((p) => p.includes('|'));
      if (!range) return matchesSearch;

      const [startTs, endTs] = range.split('|').map(Number);
      const itemTs = TableProductComponent.dateStrToTimestamp(item.dataCriacao);

      const matchesDate = itemTs >= startTs && itemTs <= endTs;

      return matchesSearch && matchesDate;
    };
  }

  private static dateStrToTimestamp(
    date: string | Date | null | undefined
  ): number {
    if (!date) return 0;

    if (date instanceof Date) return date.getTime();

    const [d, m, y] = date.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(DialogOverviewProductDialog, {
      width: '500px',
      data: {
        codigoProduto: 0,
        descricaoProduto: '',
        estoque: 0,
        unidades: [{ unidade: '', fator: 1 }],
      } as Produto,
    });

    dialogRef.afterClosed().subscribe((result: Produto | undefined) => {
      if (result) {
        const codigo = result.codigoProduto ?? 0;
        const nome = result.descricaoProduto
          .trim()
          .replace(/\s+/g, '')
          .toUpperCase();
        const descricaoFormatada = `ENTRADA-${codigo}-${nome}`;

        const novoProduto: Produto = {
          ...result,
          id: result.id ?? 0,
          descricaoProduto: descricaoFormatada,
          dataCriacao: new Date().toISOString(),
          codigoProduto: result.codigoProduto ?? 0,
          estoque: result.estoque ?? 0,
        };

        this.data.unshift(novoProduto);
        this.dataSource.data = [...this.data];
        this.produtoService.adicionarProduto(novoProduto);
      }
    });
  }
}

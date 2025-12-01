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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ColumnTable } from '../../../../models/column.interface';
import { TableActionsSales } from './../../../../models/table-actions-sales.interface';
import { Venda } from '../../../../models/vendas.interface';

import { VendedorService } from '../../../../services/sales.service';

import { ButtonComponent } from '../../../../components/button/button.component';
import { FilterComponent } from '../../../../components/filter/filter.component';
import { DialogOverviewSaleDialog } from '../sale-modal/sale-modal.component';

@Component({
  selector: 'app-sale-table',
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
    MatSnackBarModule,
    FilterComponent,
    ButtonComponent,
  ],
  templateUrl: './sale-table.component.html',
  styleUrls: ['./sale-table.component.css'],
})
export class TableSaleComponent implements AfterViewInit, OnChanges {
  @Input() columns: ColumnTable[] = [];
  @Input() data: Venda[] = [];
  @Input() showActions: boolean = true;
  @Input() actions: TableActionsSales = { editar: true, excluir: true };
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() loading: boolean = false;

  @Output() action = new EventEmitter<{
    type: keyof TableActionsSales;
    row: Venda;
  }>();

  dataSource = new MatTableDataSource<Venda>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private vendaService = inject(VendedorService);
  private snackBar = inject(MatSnackBar);

  private searchValue = '';
  private rangeValue = '';

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyCustomFilter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.dataSource.data = this.data;
    }
  }

  get displayedColumns(): string[] {
    const baseColumns = this.columns.map((col) => col.field);
    const hasActions = this.actions?.editar || this.actions?.excluir;
    return this.showActions && hasActions
      ? [...baseColumns, 'actions']
      : baseColumns;
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
      const startTs = TableSaleComponent.dateStrToTimestamp(startStr);
      const endTs = TableSaleComponent.dateStrToTimestamp(endStr);
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
    this.dataSource.filterPredicate = (item: Venda, filter: string) => {
      const parts = filter.split(' ');
      const search = parts.find((p) => !p.includes('|')) || '';
      const matchesSearch = search
        ? JSON.stringify(item).toLowerCase().includes(search)
        : true;

      const range = parts.find((p) => p.includes('|'));
      if (!range) return matchesSearch;

      const [startTs, endTs] = range.split('|').map(Number);
      const itemTs = TableSaleComponent.dateStrToTimestamp(item.dataCriacao);
      return matchesSearch && itemTs >= startTs && itemTs <= endTs;
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

  @Output() saleAdded = new EventEmitter<Venda>();

  addSale(): void {
    const dialogRef = this.dialog.open(DialogOverviewSaleDialog, {
      width: '500px',
      data: { id: 0, vendedor: '', valor: 0, comissao: 0 } as Venda,
    });

    dialogRef.afterClosed().subscribe((result: Venda | undefined) => {
      if (result) {
        const novaVenda: Venda = {
          ...result,
          id: result.id ?? 0,
          vendedor: result.vendedor.trim(),
          valor: Number(result.valor),
          dataCriacao: new Date().toISOString(),
          comissao: result.comissao ?? 0,
        };
        this.data.unshift(novaVenda);
        this.dataSource.data = [...this.data];
        this.vendaService.adicionarVenda(novaVenda);

        this.saleAdded.emit(novaVenda);

        this.snackBar.open('Venda adicionada com sucesso!', 'X', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar-success'],
        });
      }
    });
  }

  editSale(venda: Venda): void {
    this.action.emit({ type: 'editar', row: venda });
  }

  deleteSale(venda: Venda): void {
    this.action.emit({ type: 'excluir', row: venda });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ColumnTable } from './../../models/column.interface';
import { Venda } from '../../models/vendas.interface';

import { VendedorService } from '../../services/sales.service';

import { TableSaleComponent } from './components/sale-table/sale-table.component';
import { DialogOverviewSaleDialog } from './components/sale-modal/sale-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [CommonModule, TableSaleComponent, MatDialogModule],
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.css'],
})
export class VendedoresComponent implements OnDestroy {
  private vendaService = inject(VendedorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  columns: ColumnTable[] = [
    { field: 'id', header: 'Código' },
    { field: 'vendedor', header: 'Nome' },
    { field: 'valor', header: 'Venda' },
    { field: 'comissao', header: 'Comissão' },
    { field: 'dataCriacao', header: 'Data' },
  ];

  data: Venda[] = [];
  loading = true;
  dataSource = new MatTableDataSource<Venda>();

  totalVendas$ = new BehaviorSubject<number>(0);
  totalComissao$ = new BehaviorSubject<number>(0);

  private subscriptions = new Subscription();

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.vendaService.carregarVendas().subscribe({
      next: (vendas) => {
        const vendasConvertidas = vendas.map((v: Venda) => ({
          ...v,
          valor: Number(v.valor),
          comissao: Number(v.comissao),
        }));

        this.data = [...vendasConvertidas];
        this.dataSource.data = [...vendasConvertidas];
        this.loading = false;

        this.updateTotals();
      },

      error: () => {
        console.warn('Erro ao carregar vendas.');
        this.data = [];
        this.dataSource.data = [];
        this.loading = false;
        this.snackBar.open('Erro ao carregar as vendas.', 'X', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar-error'],
        });
      },
    });
  }

  updateTotals() {
    const totalVendas = this.data.reduce(
      (sum, venda: Venda) => sum + venda.valor,
      0
    );

    const totalComissao = this.data.reduce(
      (sum, venda: Venda) => sum + venda.comissao,
      0
    );

    this.totalVendas$.next(totalVendas);
    this.totalComissao$.next(totalComissao);
  }

  onTableAction(event: { type: 'editar' | 'excluir'; row: Venda }) {
    const venda = event.row;

    if (event.type === 'excluir') {
      const modalData = {
        message: `Deseja realmente excluir a venda de ${venda.vendedor}?`,
        actions: [
          {
            text: 'Cancelar',
            callback: () => {
              console.log('Exclusão cancelada');
            },
          },
          {
            text: 'Confirmar',
            callback: () => {
              const vendas: Venda[] = JSON.parse(
                localStorage.getItem('vendas') || '[]'
              );
              const index = vendas.findIndex((v: Venda) => v.id === venda.id);

              if (index !== -1) {
                vendas.splice(index, 1);
                localStorage.setItem('vendas', JSON.stringify(vendas));

                this.data = [...vendas];
                this.dataSource.data = [...this.data];

                this.updateTotals();

                this.snackBar.open('Venda excluída com sucesso!', 'X', {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['custom-snackbar-success'],
                });
              }
            },
          },
        ],
      };

      this.dialog.open(ModalComponent, {
        data: modalData,
        width: '300px',
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogOverviewSaleDialog, {
      width: '500px',
      data: { ...venda },
    });

    dialogRef.afterClosed().subscribe((result: Venda | undefined) => {
      if (!result) return;

      const vendas: Venda[] = JSON.parse(
        localStorage.getItem('vendas') || '[]'
      );
      const index = vendas.findIndex((v: Venda) => v.id === venda.id);

      if (index !== -1) {
        vendas[index] = {
          ...vendas[index],
          vendedor: result.vendedor.trim(),
          valor: Number(result.valor),
          comissao: Number(result.comissao),
          dataCriacao: result.dataCriacao || vendas[index].dataCriacao,
        };

        localStorage.setItem('vendas', JSON.stringify(vendas));

        this.data = [...vendas];
        this.dataSource.data = [...this.data];

        this.updateTotals();

        this.snackBar.open('Venda atualizada com sucesso!', 'X', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar'],
        });
      }
    });
  }

  onSaleAdded(venda: Venda) {
    this.data.unshift(venda);
    this.dataSource.data = [...this.data];

    this.updateTotals();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

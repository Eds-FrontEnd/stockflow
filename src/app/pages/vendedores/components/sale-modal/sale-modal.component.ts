import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Venda } from '../../../../models/vendas.interface';

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  templateUrl: './sale-modal.component.html',
  styleUrls: ['./sale-modal.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class DialogOverviewSaleDialog implements OnInit {
  readonly dialogRef =
    inject<MatDialogRef<DialogOverviewSaleDialog>>(MatDialogRef);
  readonly data = inject<Venda>(MAT_DIALOG_DATA);

  inputValor: string = '';
  formattedComissao: string = '';

  constructor() {
    if (!this.data.id) {
      this.data.vendedor = '';
      this.data.valor = 0;
      this.data.comissao = 0;
      this.data.dataCriacao = new Date().toISOString();
    }
  }

  ngOnInit() {
    this.formatValues();
  }

  onValorFocus(): void {
    this.inputValor = this.data.valor > 0 ? this.data.valor.toString() : '';
  }

  onValorBlur(): void {
    this.formatValues();
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\./g, '').replace(',', '.');

    const valorNum = parseFloat(sanitized);
    this.data.valor = isNaN(valorNum) ? 0 : valorNum;

    this.calcularComissao();

    this.inputValor = input.value;
  }

  calcularComissao(): void {
    const valor = this.data.valor || 0;
    let comissao = 0;

    if (valor < 100) {
      comissao = 0;
    } else if (valor < 500) {
      comissao = valor * 0.01;
    } else {
      comissao = valor * 0.05;
    }

    this.data.comissao = Number(comissao.toFixed(2));
    this.formatComissao();
  }

  formatValues() {
    this.inputValor = this.data.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this.formatComissao();
  }

  formatComissao() {
    this.formattedComissao = this.data.comissao.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

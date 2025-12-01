import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProdutoDialogData } from '../../../../models/modal.interface';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,
  ],
})
export class DialogOverviewProductDialog {
  readonly dialogRef = inject(MatDialogRef<DialogOverviewProductDialog>);
  readonly data = inject<ProdutoDialogData>(MAT_DIALOG_DATA);

  constructor() {
    if (!this.data.id) {
      this.data.codigoProduto = null;
      this.data.descricaoProduto = '';
      this.data.estoque = 0;
      this.data.unidades = [{ unidade: '', fator: 1 }];
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addUnidade() {
    this.data.unidades.push({ unidade: '', fator: 1 });
  }

  removeUnidade(index: number) {
    this.data.unidades.splice(index, 1);
  }

  isUnidadesValid(): boolean {
    return this.data.unidades.some((u) => u.unidade && u.fator > 0);
  }

  onUnidadeChange(unidadeObj: { unidade: string }) {
    unidadeObj.unidade = unidadeObj.unidade.toUpperCase();
  }
}

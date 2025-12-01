import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';

import { Produto } from '../models/produto.interface';

import { MatSnackBar } from '@angular/material/snack-bar';

import { environmentProducts } from '../../environments/environment';

import { DateFormatPipe } from '../shared/pipes/format-pipe/date-format.pipe';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly url = environmentProducts.apiUrl;
  private readonly LS_PRODUTOS = 'produtos';

  private dateFormatPipe = new DateFormatPipe();

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

  carregarProdutos(): Observable<Produto[]> {
    try {
      const local = localStorage.getItem(this.LS_PRODUTOS);

      if (local) {
        const parsed: Produto[] = JSON.parse(local);
        const parsedData = this.parseData(parsed);

        parsedData.forEach((produto) => {
          if (produto.dataCriacao) {
            produto.dataCriacao = this.dateFormatPipe.transform(
              produto.dataCriacao
            );
          }
        });
        return of(parsedData).pipe(delay(1000));
      }

      return this.http.get<Produto[]>(this.url).pipe(
        delay(400),
        map((lista) => {
          const parsedData = this.parseData(lista);

          parsedData.forEach((produto) => {
            if (produto.dataCriacao) {
              produto.dataCriacao = this.dateFormatPipe.transform(
                produto.dataCriacao
              );
            }
          });
          localStorage.setItem(this.LS_PRODUTOS, JSON.stringify(parsedData));
          return parsedData;
        })
      );
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this._snackBar.open('Erro ao carregar produtos!', 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error'],
      });
      return of([]);
    }
  }

  private parseData(lista: Produto[]): Produto[] {
    try {
      return lista.map((p) => ({
        ...p,
        unidades: p.unidades ?? [],
        unidadeTexto: p.unidades?.map((u) => u.unidade).join(', ') ?? '',
        fatorTexto: p.unidades?.map((u) => u.fator).join(', ') ?? '',
      }));
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      this._snackBar.open('Erro ao processar dados dos produtos!', 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error'],
      });
      return [];
    }
  }

  adicionarProduto(produto: Produto): void {
    try {
      const local = localStorage.getItem(this.LS_PRODUTOS);
      const lista: Produto[] = local ? JSON.parse(local) : [];

      const idsExistentes = lista.map((p) => Number(p.id) || 0);
      const ultimoId = idsExistentes.length ? Math.max(...idsExistentes) : 0;
      produto.id = ultimoId + 1;

      if (!produto.unidades || produto.unidades.length === 0) {
        produto.unidades = [{ unidade: 'UN', fator: 1 }];
      }

      const dataCriacao = new Date();
      produto.dataCriacao = this.dateFormatPipe.transform(dataCriacao);

      produto.unidadeTexto = produto.unidades.map((u) => u.unidade).join(', ');
      produto.fatorTexto = produto.unidades.map((u) => u.fator).join(', ');

      lista.unshift(produto);

      lista.forEach((prod) => {
        if (prod.dataCriacao) {
          prod.dataCriacao = this.dateFormatPipe.transform(prod.dataCriacao);
        }
      });

      localStorage.setItem(this.LS_PRODUTOS, JSON.stringify(lista));

      this._snackBar.open('Produto adicionado com sucesso!', 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-success'],
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);

      this._snackBar.open(
        'Erro ao adicionar o produto. Tente novamente!',
        'X',
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar-error'],
        }
      );
    }
  }
}

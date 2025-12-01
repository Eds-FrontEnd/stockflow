import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environmentSale } from '../../environments/environment';
import { DateFormatPipe } from '../shared/pipes/format-pipe/date-format.pipe';
import { Venda } from '../models/vendas.interface';

@Injectable({
  providedIn: 'root',
})
export class VendedorService {
  private readonly url = environmentSale.apiUrl;
  private readonly LS_VENDAS = 'vendas';

  private dateFormatPipe = new DateFormatPipe();

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

  carregarVendas(): Observable<Venda[]> {
    try {
      const local = localStorage.getItem(this.LS_VENDAS);

      if (local) {
        const lista: Venda[] = JSON.parse(local);

        lista.forEach((v) => {
          v.dataCriacao = this.dateFormatPipe.transform(v.dataCriacao);
        });

        return of(lista).pipe(delay(500));
      }

      return this.http.get<Venda[]>(this.url).pipe(
        map((lista) => {
          lista.forEach((v) => {
            v.dataCriacao = this.dateFormatPipe.transform(v.dataCriacao);
          });

          localStorage.setItem(this.LS_VENDAS, JSON.stringify(lista));

          return lista;
        }),
        catchError((error) => {
          this._snackBar.open(
            `Erro ao carregar arquivo vendas.json! ${error}`,
            'X',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['custom-snackbar-error'],
            }
          );

          return of([]);
        })
      );
    } catch (error) {
      this._snackBar.open(`Erro geral. ${error}`, 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error'],
      });
      return of([]);
    }
  }

  adicionarVenda(venda: Venda): void {
    try {
      const local = localStorage.getItem(this.LS_VENDAS);
      const lista: Venda[] = local ? JSON.parse(local) : [];

      const lastId = lista.length ? Math.max(...lista.map((v) => v.id)) : 0;
      venda.id = lastId + 1;

      const dataHoje = new Date();
      venda.dataCriacao = this.dateFormatPipe.transform(dataHoje);

      lista.unshift(venda);

      localStorage.setItem(this.LS_VENDAS, JSON.stringify(lista));

      this._snackBar.open('Venda adicionada com sucesso!', 'X', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-success'],
      });
    } catch (error) {
      this._snackBar.open('Erro ao adicionar venda.', 'X', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error'],
      });
    }
  }
}

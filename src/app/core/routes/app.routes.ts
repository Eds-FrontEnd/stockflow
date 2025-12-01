import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VendedoresComponent } from '../../pages/vendedores/vendedores.component';
import { HomeComponent } from '../../pages/home/home.component';
import { Page404Component } from '../../pages/page404/page404.component';
import { ConsultaComponent } from '../../pages/consulta/consulta.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'vendedores',
    component: VendedoresComponent,
  },
  {
    path: 'consulta',
    component: ConsultaComponent,
  },
  {
    path: '404',
    component: Page404Component,
  },
  {
    path: '**',
    redirectTo: '404',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

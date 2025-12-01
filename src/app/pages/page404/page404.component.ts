import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { ImageComponent } from '../../components/image/image.component';

@Component({
  selector: 'app-page404',
  imports: [ButtonComponent, ImageComponent],
  templateUrl: './page404.component.html',
  styleUrl: './page404.component.css',
})
export class Page404Component {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/home']);
  }
}

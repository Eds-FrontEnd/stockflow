import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() label: string = 'Clique aqui';
  @Input() ariaLabel?: string;
  @Input() link?: string;
  @Output() btnClick = new EventEmitter<void>();

  @Input() bgColor: string = 'var(--blue)';
  @Input() textColor: string = 'var(--white)';

  handleClick() {
    this.btnClick.emit();
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image',
  imports: [CommonModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  @Input() src!: string;

  @Input() alt: string = '';

  @Input() title?: string;

  @Input() width?: string | number;
  @Input() height?: string | number;

  @Input() loading: 'lazy' | 'eager' = 'lazy';

  @Input() decoding: 'sync' | 'async' | 'auto' = 'async';

  @Input() fetchpriority: 'high' | 'low' | 'auto' = 'low';

  @Input() srcset?: string;

  @Input() sizes?: string;

  @Input() className?: string;

  @Input() ariaHidden: boolean = false;

  @Input() role?: string;

  @Input() caption?: string;

  @Input() priority: boolean = false;
}

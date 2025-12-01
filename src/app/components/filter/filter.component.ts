import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { DatepickerRangeComponent } from '../datepicker/datepicker.component';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    DatepickerRangeComponent,
    MatIconModule,
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  @Output() filterChange = new EventEmitter<string>();

  private searchValue = '';
  private startTs?: number;
  private endTs?: number;

  onFilterChange(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.emitFilter();
  }

  onRangeChange(event: { start?: string | null; end?: string | null }) {
    const startStr = event.start?.trim();
    const endStr = event.end?.trim();

    if (startStr && endStr) {
      const [d1, m1, y1] = startStr.split('-').map(Number);
      const [d2, m2, y2] = endStr.split('-').map(Number);

      this.startTs = new Date(y1, m1 - 1, d1).getTime();
      this.endTs = new Date(y2, m2 - 1, d2).getTime();
    } else {
      this.startTs = undefined;
      this.endTs = undefined;
    }

    this.emitFilter();
  }

  private emitFilter() {
    const rangeStr =
      this.startTs !== undefined && this.endTs !== undefined
        ? `${this.startTs}|${this.endTs}`
        : '';

    const filterStr = [this.searchValue, rangeStr].filter(Boolean).join(' ');
    this.filterChange.emit(filterStr);
  }

  static dateStrToTimestamp(dateStr: string | null | undefined): number {
    if (!dateStr) return 0;
    const [d, m, y] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
}

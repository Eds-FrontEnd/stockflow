import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalComponent, ModalData } from '../modal/modal.component';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
})
export class DatepickerRangeComponent {
  @Output() rangeChange = new EventEmitter<{ start: string; end: string }>();

  range: FormGroup = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  maxDate: Date = new Date();
  minDate: Date = new Date(1975, 0, 1);

  constructor(private dialog: MatDialog) {
    this.range.valueChanges.subscribe(
      (val: { start: Date | null; end: Date | null }) => {
        const start = val.start;
        const end = val.end;

        if (start && end) {
          this.rangeChange.emit({
            start: this.formatToBR(start),
            end: this.formatToBR(end),
          });
        } else {
          this.rangeChange.emit({ start: '', end: '' });
        }
      }
    );
  }

  clearRange(): void {
    this.range.get('start')?.setValue(null);
    this.range.get('end')?.setValue(null);
  }

  private formatToBR(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  onEndClick(pickerEnd: any) {
    if (!this.range.get('start')?.value) {
      const modalData: ModalData = {
        message:
          'Selecione primeiro a Data Início antes de escolher a Data Fim.',
        actions: [
          {
            text: 'OK',
            callback: () => {},
          },
        ],
      };
      this.dialog.open(ModalComponent, {
        data: modalData,
      });
    } else {
      pickerEnd.open();
    }
  }
}

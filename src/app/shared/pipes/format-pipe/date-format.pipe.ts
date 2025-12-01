import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const valueStr = String(value);
    const regex = /^\d{2}-\d{2}-\d{4}$/;

    if (regex.test(valueStr)) {
      return valueStr;
    }

    const data = new Date(value);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}-${mes}-${ano}`;
  }
}

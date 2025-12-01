import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerRangeComponent } from './datepicker.component';

describe('DatepickerComponent', () => {
  let component: DatepickerRangeComponent;
  let fixture: ComponentFixture<DatepickerRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerRangeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

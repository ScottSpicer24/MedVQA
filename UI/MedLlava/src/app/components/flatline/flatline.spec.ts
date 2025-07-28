import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flatline } from './flatline';

describe('Flatline', () => {
  let component: Flatline;
  let fixture: ComponentFixture<Flatline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flatline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Flatline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

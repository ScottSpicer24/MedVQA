import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Heartbeat } from './heartbeat';

describe('Heartbeat', () => {
  let component: Heartbeat;
  let fixture: ComponentFixture<Heartbeat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Heartbeat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Heartbeat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

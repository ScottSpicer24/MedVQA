import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndpointStatus } from './endpoint-status';

describe('EndpointStatus', () => {
  let component: EndpointStatus;
  let fixture: ComponentFixture<EndpointStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndpointStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndpointStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

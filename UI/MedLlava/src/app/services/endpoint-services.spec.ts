import { TestBed } from '@angular/core/testing';

import { EndpointServices } from './endpoint-services';

describe('EndpointServices', () => {
  let service: EndpointServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

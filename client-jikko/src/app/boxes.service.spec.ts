import { TestBed, inject } from '@angular/core/testing';

import { BoxesService } from './boxes.service';

describe('BoxesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoxesService]
    });
  });

  it('should be created', inject([BoxesService], (service: BoxesService) => {
    expect(service).toBeTruthy();
  }));
});

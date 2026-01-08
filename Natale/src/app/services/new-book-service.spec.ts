import { TestBed } from '@angular/core/testing';

import { NewBookService } from './new-book-service';

describe('NewBookService', () => {
  let service: NewBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

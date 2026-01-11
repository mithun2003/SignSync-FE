import { TestBed } from '@angular/core/testing';
import { HandDetectService } from './hand-detect.service';


describe('HandDetectService', () => {
  let service: HandDetectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandDetectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

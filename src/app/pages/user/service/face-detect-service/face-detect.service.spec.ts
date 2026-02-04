/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FaceDetectService } from './face-detect.service';

describe('Service: FaceDetect', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FaceDetectService]
    });
  });

  it('should ...', inject([FaceDetectService], (service: FaceDetectService) => {
    expect(service).toBeTruthy();
  }));
});

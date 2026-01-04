import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestureDetectionComponent } from './gesture-detection.component';

describe('GestureDetectionComponent', () => {
  let component: GestureDetectionComponent;
  let fixture: ComponentFixture<GestureDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestureDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestureDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignManagementComponent } from './sign-management.component';

describe('SignManagementComponent', () => {
  let component: SignManagementComponent;
  let fixture: ComponentFixture<SignManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

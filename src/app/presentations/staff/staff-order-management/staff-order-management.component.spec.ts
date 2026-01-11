import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffOrderManagementComponent } from './staff-order-management.component';

describe('StaffOrderManagementComponent', () => {
  let component: StaffOrderManagementComponent;
  let fixture: ComponentFixture<StaffOrderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffOrderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

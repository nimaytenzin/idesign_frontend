import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDocumentArchiveComponent } from './staff-document-archive.component';

describe('StaffDocumentArchiveComponent', () => {
  let component: StaffDocumentArchiveComponent;
  let fixture: ComponentFixture<StaffDocumentArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffDocumentArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffDocumentArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

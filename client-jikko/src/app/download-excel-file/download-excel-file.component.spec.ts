import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadExcelFileComponent } from './download-excel-file.component';

describe('DownloadExcelFileComponent', () => {
  let component: DownloadExcelFileComponent;
  let fixture: ComponentFixture<DownloadExcelFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadExcelFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadExcelFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

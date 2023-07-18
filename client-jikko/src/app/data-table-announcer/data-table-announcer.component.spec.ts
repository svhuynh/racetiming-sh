import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableAnnouncerComponent } from './data-table-announcer.component';

describe('DataTableAnnouncerComponent', () => {
  let component: DataTableAnnouncerComponent;
  let fixture: ComponentFixture<DataTableAnnouncerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTableAnnouncerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableAnnouncerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

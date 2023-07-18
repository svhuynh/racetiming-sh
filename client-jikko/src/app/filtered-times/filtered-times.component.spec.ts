import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredTimesComponent } from './filtered-times.component';

describe('FilteredTimesComponent', () => {
  let component: FilteredTimesComponent;
  let fixture: ComponentFixture<FilteredTimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilteredTimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteredTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

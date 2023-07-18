import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsOptionsComponent } from './results-options.component';

describe('ResultsOptionsComponent', () => {
  let component: ResultsOptionsComponent;
  let fixture: ComponentFixture<ResultsOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

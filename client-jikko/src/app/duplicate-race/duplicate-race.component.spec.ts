import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateRaceComponent } from './duplicate-race.component';

describe('DuplicateRaceComponent', () => {
  let component: DuplicateRaceComponent;
  let fixture: ComponentFixture<DuplicateRaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateRaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateRaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

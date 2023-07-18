import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceVisuComponent } from './race-visu.component';

describe('RaceVisuComponent', () => {
  let component: RaceVisuComponent;
  let fixture: ComponentFixture<RaceVisuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceVisuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

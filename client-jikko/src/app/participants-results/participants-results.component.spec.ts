import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantsResultsComponent } from './participants-results.component';

describe('ParticipantsResultsComponent', () => {
  let component: ParticipantsResultsComponent;
  let fixture: ComponentFixture<ParticipantsResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantsResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

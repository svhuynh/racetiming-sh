import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableBoxesComponent } from './available-boxes.component';

describe('AvailableBoxesComponent', () => {
  let component: AvailableBoxesComponent;
  let fixture: ComponentFixture<AvailableBoxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableBoxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

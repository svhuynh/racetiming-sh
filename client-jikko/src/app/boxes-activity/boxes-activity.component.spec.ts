import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxesActivityComponent } from './boxes-activity.component';

describe('BoxesActivityComponent', () => {
  let component: BoxesActivityComponent;
  let fixture: ComponentFixture<BoxesActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxesActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxesActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

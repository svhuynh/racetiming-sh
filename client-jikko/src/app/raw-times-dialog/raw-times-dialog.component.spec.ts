import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RawTimesDialogComponent } from './raw-times-dialog.component';

describe('RawTimesDialogComponent', () => {
  let component: RawTimesDialogComponent;
  let fixture: ComponentFixture<RawTimesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RawTimesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawTimesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BibsComponent } from './bibs.component';

describe('BibsComponent', () => {
  let component: BibsComponent;
  let fixture: ComponentFixture<BibsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BibsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BibsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

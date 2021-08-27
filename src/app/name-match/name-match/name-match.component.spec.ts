import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameMatchComponent } from './name-match.component';

describe('NameMatchComponent', () => {
  let component: NameMatchComponent;
  let fixture: ComponentFixture<NameMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameMatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mesg } from './mesg';

describe('Mesg', () => {
  let component: Mesg;
  let fixture: ComponentFixture<Mesg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mesg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mesg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

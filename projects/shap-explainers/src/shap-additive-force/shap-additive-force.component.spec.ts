import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapAdditiveForceComponent } from './shap-additive-force.component';

describe('ShapAdditiveForceComponent', () => {
  let component: ShapAdditiveForceComponent;
  let fixture: ComponentFixture<ShapAdditiveForceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShapAdditiveForceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShapAdditiveForceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapInfluenceComponent } from './shap-influence.component';

describe('ShapInfluenceComponent', () => {
  let component: ShapInfluenceComponent;
  let fixture: ComponentFixture<ShapInfluenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShapInfluenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShapInfluenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { NgModule } from '@angular/core';
import { ShapAdditiveForceArrayComponent } from './shap-additive-force-array.component';
import { ShapAdditiveForceComponent } from './shap-additive-force.component';

@NgModule({
  declarations: [ShapAdditiveForceComponent, ShapAdditiveForceArrayComponent],
  imports: [],
  exports: [ShapAdditiveForceComponent, ShapAdditiveForceArrayComponent],
})
export class ShapExplainersModule {}

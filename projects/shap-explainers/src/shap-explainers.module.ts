import { NgModule } from '@angular/core';
import { ShapAdditiveForceArrayComponent } from './shap-additive-force-array/shap-additive-force-array.component';
import { ShapAdditiveForceComponent } from './shap-additive-force/shap-additive-force.component';
import { ShapInfluenceComponent } from './shap-influence/shap-influence.component';

@NgModule({
  declarations: [
    ShapAdditiveForceComponent,
    ShapAdditiveForceArrayComponent,
    ShapInfluenceComponent,
  ],
  imports: [],
  exports: [
    ShapAdditiveForceComponent,
    ShapAdditiveForceArrayComponent,
    ShapInfluenceComponent,
  ],
})
export class ShapExplainersModule {}

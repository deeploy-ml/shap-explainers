import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExplainersComponent } from './explainers/explainers.component';

const routes: Routes = [
  {
    path: '',
    component: ExplainersComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

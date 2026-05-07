import { NgModule } from '@angular/core';
import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjetsComponent } from './projets/projets.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    ProjetsComponent,
  ],
  imports: [
    SharedModule,
    EmployeeRoutingModule,
  ]
})
export class EmployeeModule { }

import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProjetsComponent } from './projets/projets.component';
import { AddMemberDialogComponent } from './projets/add-member-dialog.component';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EmployeesComponent,
    CategoriesComponent,
    ProjetsComponent,
    AddMemberDialogComponent,
    LayoutComponent,
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    NgChartsModule,
  ]
})
export class AdminModule { }
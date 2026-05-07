import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProjetsComponent } from './projets/projets.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,   // ← parent shell
    children: [                   // ← all admin pages are children
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: DashboardComponent },
      { path: 'employees',    component: EmployeesComponent },
      { path: 'categories',   component: CategoriesComponent },
      { path: 'projets',      component: ProjetsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
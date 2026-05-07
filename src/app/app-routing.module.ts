import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { EmployeeGuard } from './core/guards/employee.guard';

const routes: Routes = [

  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Login page — no guard needed
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },

  // Admin routes — protected by adminGuard
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },

  // Employee routes — protected by employeeGuard
  {
    path: 'employee',
    canActivate: [EmployeeGuard],
    loadChildren: () =>
      import('./employee/employee.module').then(m => m.EmployeeModule)
  },

  // Catch all — redirect unknown URLs to login
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
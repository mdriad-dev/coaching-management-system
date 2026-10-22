import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { LandingComponent } from './landing.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: LandingComponent },
  { path: '**', redirectTo: '' },
];

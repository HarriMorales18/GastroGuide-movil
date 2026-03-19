import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { LayoutComponent as StudentLayout } from './features/student/layout/layout.component';
import { LayoutComponent as CreatorLayout } from './features/creator/layout/layout.component';
import { LayoutComponent as AdminLayout } from './features/admin/layout/layout.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // layouts por rol
  { path: 'student', component: StudentLayout },
  { path: 'creator', component: CreatorLayout },
  { path: 'admin', component: AdminLayout },

  { path: '**', redirectTo: '' }
];

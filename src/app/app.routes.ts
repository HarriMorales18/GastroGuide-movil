import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

import { LayoutComponent as StudentLayout } from './features/student/pages/layout/layout.component';
import { LayoutComponent as CreatorLayout } from './features/creator/pages/layout/layout.component';
import { LayoutComponent as AdminLayout } from './features/admin/pages/layout/layout.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // layouts por rol
  { path: 'student', component: StudentLayout },
  { path: 'creator', component: CreatorLayout },
  { path: 'admin', component: AdminLayout },

  { path: '**', redirectTo: '' }
];

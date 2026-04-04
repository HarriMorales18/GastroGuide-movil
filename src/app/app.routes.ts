import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/pages/login/login.component';
import { RegisterComponent } from '@features/auth/pages/register/register.component';
import { ForgotPasswordComponent } from '@features/auth/pages/forgot-password/forgot-password.component';

import { LayoutComponent as StudentLayout } from '@features/student/pages/layout/layout.component';
import { LayoutComponent as CreatorLayout } from '@features/creator/pages/layout/layout.component';
import { LayoutComponent as AdminLayout } from '@features/admin/pages/layout/layout.component';
import { WalletComponent } from '@features/creator/pages/wallet/wallet.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // layouts por rol
  { path: 'student', component: StudentLayout },
  { path: 'creator/wallet', component: WalletComponent },
  { path: 'creator', component: CreatorLayout },
  { path: 'admin', component: AdminLayout },
  { path: '**', redirectTo: '' }
];

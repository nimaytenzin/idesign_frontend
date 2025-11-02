import { Routes } from '@angular/router';
import { publicRoutes } from './presentations/public/public.routes';
import { adminRoutes } from './presentations/admin/admin.routes';
import { authRoutes } from './presentations/auth/auth.routes';

export const routes: Routes = [...publicRoutes, ...authRoutes, ...adminRoutes];

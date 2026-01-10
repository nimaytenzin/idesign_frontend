import { Routes } from '@angular/router';
import { publicRoutes } from './presentations/public/public.routes';
import { adminRoutes } from './presentations/admin/admin.routes';
import { authRoutes } from './presentations/auth/auth.routes';
import { staffRoutes } from './presentations/staff/staff.routes';
import { affiliateMarketerRoutes } from './presentations/affiliate-marketer/affiliate.route';

export const routes: Routes = [...publicRoutes, ...authRoutes, ...adminRoutes,...staffRoutes,...affiliateMarketerRoutes];

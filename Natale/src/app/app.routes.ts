import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './auth/auth-guard';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

export const routes: Routes = [
    //sintassi di authGuard
    { path: 'home', component: Home,
    canActivate: [authGuard] },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './auth/auth-guard';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Mesg } from './pages/mesg/mesg';
import { Profilo } from './pages/profilo/profilo';

export const routes: Routes = [
    //sintassi di authGuard
    { path: 'home', component: Home,
    canActivate: [authGuard] },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'mesg', component: Mesg },
    { path: 'profile', component: Profilo },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
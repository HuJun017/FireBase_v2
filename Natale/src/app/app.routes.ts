import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './auth/auth-guard';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Mesg } from './pages/mesg/mesg';
import { Library } from './pages/library/library';
import { Profilo } from './pages/profilo/profilo';

export const routes: Routes = [
    //sintassi di authGuard
    { path: 'home', component: Home,
    canActivate: [authGuard] },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'mesg', component: Mesg },
    { path: 'library', component: Library },
    { path: 'profile', component: Profilo },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
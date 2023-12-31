import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './libs/auth.guard';

const routes: Routes = [
  {
  path: '',
  component: LoginComponent
  },
  {
    path:'home',
    component: HomeComponent,
     canActivate:[AuthGuard],
  },
  {
  path:'**',
  component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

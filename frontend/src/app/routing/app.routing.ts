import { Routes, RouterModule } from '@angular/router';

import { ViewFormsComponent } from '../components/view-forms/view-forms.component';
//import { CounterComponent } from '../components/counter/counter.component';
//import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
//import { MemberListComponent } from '../components/memberlist/memberlist.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { LoginComponent } from '../components/login/login.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';
import { ViewInstanceComponent } from '../components/view-instance/view-instance.component';
import {CreateEditFormComponent} from "../components/create-edit-form/create-edit-form.component";

const appRoutes: Routes = [
    //{ path: '', component: HomeComponent, pathMatch: 'full' },
    //{ path: 'counter', component: CounterComponent },
    //{ path: 'fetch-data', component: FetchDataComponent },
   /* {
        path: 'user',
        component: MemberListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },*/
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'restricted', component: RestrictedComponent },
    { path: 'home', component: ViewFormsComponent, canActivate: [AuthGuard] },
    { path: 'view-instance/:id', component: ViewInstanceComponent, canActivate: [AuthGuard] },
    { path: 'create-edit-form', component: CreateEditFormComponent, canActivate: [AuthGuard] },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);

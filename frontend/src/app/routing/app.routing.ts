import { Routes, RouterModule } from '@angular/router';

import { View_forms } from '../components/view-forms/view-forms.component';
//import { CounterComponent } from '../components/counter/counter.component';
//import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
//import { MemberListComponent } from '../components/memberlist/memberlist.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { LoginComponent } from '../components/login/login.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';

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
    { path: 'home', component: View_forms, canActivate: [AuthGuard] },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);

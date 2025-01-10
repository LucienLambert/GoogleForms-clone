import { Routes, RouterModule } from '@angular/router';

import { ViewFormsComponent } from '../components/view-forms/view-forms.component';
import { ViewFormComponent } from '../components/view-form/view-form.component';
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
import {AnalyseComponent} from "../components/analyse/analyse.component";
import {ManageOptionsListComponent} from "../components/manage-option-lists/manage-option-lists.component";
import {AddEditOptionListComponent} from "../components/add-edit-option-list/add-edit-option-list.component";
import {ManageSharesComponent} from "../components/manage-shares/manage-shares.component";
import {SignUpComponent} from "../components/signup/signup.component";
import { CreateEditQuestionComponent } from '../components/create-edit-question/create-edit-question.component';
import { ViewInstancesComponent } from '../components/view-instances/view-instances.component';

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
    { path: 'restricted', component: RestrictedComponent },
    { path: 'home', component: ViewFormsComponent, canActivate: [AuthGuard] },
    { path: 'view-instance/:id', component: ViewInstanceComponent, canActivate: [AuthGuard] },
    { path: 'create-edit-form', component: CreateEditFormComponent, canActivate: [AuthGuard] },
    { path: 'view-form/:id', component: ViewFormComponent, canActivate: [AuthGuard] },
    { path: 'create-edit-form/:id', component: CreateEditFormComponent, canActivate: [AuthGuard] },
    { path: 'analyse/:id', component: AnalyseComponent, canActivate: [AuthGuard] },
    { path: 'manage-option-lists', component: ManageOptionsListComponent, canActivate: [AuthGuard] },
    { path: 'add-edit-option-lists', component: AddEditOptionListComponent, canActivate: [AuthGuard] },
    { path: 'add-edit-option-lists/:id', component: AddEditOptionListComponent, canActivate: [AuthGuard] },
    { path : 'manage-shares/:id', component: ManageSharesComponent, canActivate: [AuthGuard] },
    { path : 'signup', component: SignUpComponent },
    { path: 'create-edit-question', component: CreateEditQuestionComponent, canActivate: [AuthGuard] },
    { path : 'view-instances/:id', component: ViewInstancesComponent, canActivate: [AuthGuard]},
    // { path: 'create-edit-question/:id', component: CreateEditQuestionComponent, canActivate: [AuthGuard] },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);

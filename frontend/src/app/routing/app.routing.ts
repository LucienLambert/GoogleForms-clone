import {Routes, RouterModule} from '@angular/router';

import {TemplateComponent} from '../components/template/template.component';
import {UnknownComponent} from "../components/unknown/unknown.component";

const appRoutes: Routes = [
    {path: '', component: TemplateComponent, pathMatch: 'full'},
    {path: '**', component: UnknownComponent}
];

export const AppRoutes = RouterModule.forRoot(appRoutes);

import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AppRoutes} from '../routing/app.routing';

import {AppComponent} from '../components/app/app.component';
import {SetFocusDirective} from '../directives/setfocus.directive';
import {SharedModule} from './shared.module';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {fr} from 'date-fns/locale';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {NavBarComponent} from "../components/nav-bar/nav-bar.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {JwtInterceptor} from "../interceptors/jwt.interceptor";
import {UnknownComponent} from "../components/unknown/unknown.component";
import {TemplateComponent} from "../components/template/template.component";
import {LoginComponent} from "../components/login/login.component";
import {RestrictedComponent} from "../components/restricted/restricted.component";
import {ViewFormsComponent} from '../components/view-forms/view-forms.component';
import {FormCardComponent} from '../components/view-forms/form-card/form-card.component';
import {ViewInstanceComponent} from "../components/view-instance/view-instance.component";
import {CreateEditFormComponent} from "../components/create-edit-form/create-edit-form.component";
import {InstanceQuestionCardComponent} from "../components/view-instance/instance-question-card/instance-question-card.component";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {ViewFormComponent} from "../components/view-form/view-form.component";
import { FormQuestionCardComponent } from '../components/view-form/form-question-card/form-question-card.component';

@NgModule({
    declarations: [
        UnknownComponent,
        TemplateComponent,
        AppComponent, 
        SetFocusDirective,
        NavBarComponent,
        LoginComponent,
        RestrictedComponent,
        ViewFormsComponent,
        FormCardComponent,
        ViewInstanceComponent,
        CreateEditFormComponent,
        InstanceQuestionCardComponent,
        ViewFormComponent,
        FormQuestionCardComponent
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'ng-cli-universal'}),
        FormsModule,
        ReactiveFormsModule,
        AppRoutes,
        BrowserAnimationsModule,
        SharedModule,
        MatRadioGroup,
        MatRadioButton,
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: MAT_DATE_LOCALE, useValue: fr},
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: ['dd/MM/yyyy'],
                },
                display: {
                    dateInput: 'dd/MM/yyyy',
                    monthYearLabel: 'MMM yyyy',
                    dateA11yLabel: 'dd/MM/yyyy',
                    monthYearA11yLabel: 'MMM yyyy',
                },
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
    ],
    exports: [
        NavBarComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

@Component({
    selector: 'app-home',
    template: `
    <h1>Welcome, {{ user?.fullName }}</h1>
    <p>Email: {{ user?.email }}</p>
    <p>Role: {{ user?.roleAsString }}</p>
    <button (click)="logout()" class="btn btn-danger">Logout</button>
    `,
})
export class HomeComponent implements OnInit {
    user?: User;

    constructor(private authService: AuthenticationService, private router: Router) { }

    ngOnInit() {
        this.user = this.authService.currentUser;
    }

    logout() {
        this.authService.logout()
        this.router.navigate(['/login']);
    }
}

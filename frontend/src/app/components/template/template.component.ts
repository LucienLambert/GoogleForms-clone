import {Component} from '@angular/core';
import {UserService} from "../../services/user.service";
import {User} from "../../models/user";

@Component({
    selector: 'templateProject',
    templateUrl: './template.component.html',
    styleUrl: './template.component.css'
})
export class TemplateComponent {
    users?: User[];

    constructor(private userService: UserService) {
        this.userService.getAll().subscribe((res) => this.users = res)
    }
}
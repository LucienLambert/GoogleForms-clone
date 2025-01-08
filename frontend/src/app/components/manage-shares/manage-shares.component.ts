import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {User} from "../../models/user";
import {ModalDialogComponent} from "../modal-dialog/modal-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FormService} from "../../services/form.service";
import {Form} from "../../models/form";

@Component({
    selector: 'app-manage-shares',
    templateUrl: './manage-shares.component.html',
    styleUrl: './manage-shares.component.css'
})
export class ManageSharesComponent implements OnInit {

    form?: Form;
    users?: User[];
    
    //nav
    title? : string;
    
    
    isPublic? : boolean;
    
    constructor(private authService: AuthenticationService, private userService: UserService, private formService: FormService, private router: Router, private route: ActivatedRoute,) {
    }
    ngOnInit() {
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        this.fetchForm(formId);
        this.fetchUsers(formId);
    }

    private fetchForm(formId: number) {
        this.formService.getFormByFormId(formId).subscribe({
            next: data => {
                this.form = data;
                this.isPublic = data.isPublic;
                this.title = `Share: ${this.form.title}`;
            }
        })
    }
    private fetchUsers(formId:number) {
        this.userService.getAllWithFormAccess(formId).subscribe({
            next: data => {
                console.log(data);
                this.users = data;
            }
        })
    }
}
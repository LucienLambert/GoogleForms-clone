import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {Role, User} from "../../models/user";
import {FormService} from "../../services/form.service";
import {Form} from "../../models/form";
import {AccessType, UserFormAccess} from "../../models/userFormAccess";
import {MatCheckboxChange} from "@angular/material/checkbox";

export enum CheckboxType {
    User = 'User',
    Editor = 'Editor'
}
@Component({
    selector: 'app-manage-shares',
    templateUrl: './manage-shares.component.html',
    styleUrl: './manage-shares.component.css'
})

export class ManageSharesComponent implements OnInit {
    protected readonly CheckboxType = CheckboxType;
    
    form?: Form;
    users?: User[];
    usersWithAccess: User[] = [];
    usersWithNoAccess: User[] = [];
    selectedUserId: any;
    
    //nav
    title? : string;
    
    
    isPublic? : boolean;
    
    // Checkboxes on the second part of the component 
    userChecked : boolean = false;
    editorChecked : boolean = false;
    
    constructor(private authService: AuthenticationService,private userService: UserService, private formService: FormService, private router: Router, private route: ActivatedRoute,) {
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
                this.userChecked = data.isPublic;
                this.title = `Share: ${this.form.title}`;
            }
        })
    }
    private fetchUsers(formId:number) {
        this.userService.getAllWithFormAccess(formId).subscribe({
            next: data => {
                this.users = data.filter(user => this.form?.ownerId !== user.id && user.role !== Role.Admin);
                console.log(this.users);
                this.updateUsersAccessList();
            }
        })
    }

    private updateUsersAccessList() {
        if (this.users) {
            if (!this.isPublic) {
                this.usersWithAccess = this.users?.filter(user => user.listUserAccesses.length > 0);
                this.usersWithNoAccess = this.users?.filter(user => user.listUserAccesses.length == 0);
            } else {
                this.usersWithAccess = this.users?.filter(user => user.listUserAccesses.length > 0 && user.listUserAccesses.some(lu=>lu.accessType == AccessType.Editor));
                this.usersWithNoAccess = this.users?.filter(user => user.listUserAccesses.length == 0 || user.listUserAccesses.some(lu=>lu.accessType == AccessType.User));
            }
        }
    }

    onHasAccessCheckboxChange(user: User, checkboxType: CheckboxType, $event: MatCheckboxChange) {
        switch (checkboxType) {
            case CheckboxType.User:
                if ($event.checked){
                    //should never happen
                } else {
                    let userAccessToDelete = user.listUserAccesses[0];
                    user.listUserAccesses.length = 0;
                    this.usersWithAccess = this.usersWithAccess.filter(u=>u.id != user.id);
                    this.userService.deleteUserFormAccess(userAccessToDelete).subscribe({
                        next: data => {
                            console.log("deleted:",data)
                            this.updateUsersAccessList();
                        }
                    })
                }
                break;
            case CheckboxType.Editor:
                if ($event.checked){
                    user.listUserAccesses[0].accessType = AccessType.Editor;
                    this.userService.updateUserFormAccess(user.listUserAccesses[0]).subscribe({next: data => {
                        console.log("modified:",data);
                            this.updateUsersAccessList();
                        }});
                } else {
                    if (this.isPublic) {
                        let userAccessToDelete = user.listUserAccesses[0];
                        user.listUserAccesses.length = 0;
                        this.usersWithAccess = this.usersWithAccess.filter(u=>u.id != user.id);
                        this.userService.deleteUserFormAccess(userAccessToDelete).subscribe({
                            next: data => {
                                console.log("deleted:",data)
                                this.updateUsersAccessList();
                            }
                        })
                    } else {
                        user.listUserAccesses[0].accessType = AccessType.User;
                        this.userService.updateUserFormAccess(user.listUserAccesses[0]).subscribe({next: data => {
                                console.log("modified:",data);
                                this.updateUsersAccessList();
                            }});
                    }
                }
                break;
        }
    }

    onHasNoAccessCheckboxChange(checkboxType: CheckboxType, $event: MatCheckboxChange) {
        switch (checkboxType) {
            case CheckboxType.User:
                this.userChecked = $event.checked;
                console.log(this.userChecked);
                break;
            case CheckboxType.Editor:
                this.editorChecked = $event.checked;
                console.log(this.editorChecked);
                break;
        }
    }

    isCheckBox1Disabled(user: User) {
        return user.listUserAccesses.some(ul=>ul.accessType === AccessType.Editor);
    }
    

    isCheckBox2Checked(user: User) {
        return user.listUserAccesses.some(ul=>ul.accessType === AccessType.Editor);
    }

    AddButtonAction() {
        if (this.selectedUserId) {
            if (this.userChecked || this.editorChecked) {
                if (this.editorChecked) {
                    this.manageNewFormAccess(AccessType.Editor);
                } else {
                    if (!this.isPublic) {
                        this.manageNewFormAccess(AccessType.User);
                    }
                }
            }
        }
    }

    private manageNewFormAccess(accessType : AccessType) {
        let userToUpdate = this.users?.find(u=>u.id === this.selectedUserId);
        if (userToUpdate) {
            let newUserFormAccess = new UserFormAccess ({
                formId : this.form?.id,
                userId : this.selectedUserId,
                accessType : accessType
            });
            userToUpdate?.listUserAccesses.push(newUserFormAccess);
            let index = this.users?.findIndex(u => u.id === this.selectedUserId);
            if (index !== undefined && index !== -1 && this.users) {
                this.users[index] = userToUpdate;
            }
            this.userService.updateUserFormAccess(newUserFormAccess).subscribe({
                next: data => {
                    console.log("modified:",data);
                    this.updateUsersAccessList()
                }
            })
        }
    }

    isUserCheckboxDisabled() {
        return this.isPublic || this.editorChecked;
    }

    isUserCheckboxChecked() {
        return this.userChecked || this.editorChecked;
    }
}
import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";;
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {User} from "../../models/user";
import { OptionList } from '../../models/optionList';
import {lastValueFrom} from "rxjs";
import {ModalDialogComponent} from "../modal-dialog/modal-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-manage-option-lists',
    templateUrl: './manage-option-lists.component.html',
    styleUrl: './manage-option-lists.component.css'
})
export class ManageOptionsListComponent implements OnInit {
    owner?: User;
    optionLists: OptionList[] = [];

    backButtonVisible: boolean = true;
    isLoading: boolean = false;
    previousUrl: string | null = null;
    
    constructor(private router: Router, private authenticationService: AuthenticationService,
                private userService: UserService, private modalDialog: MatDialog ) {
    }
    
    ngOnInit() {
        this.retrieveOptionLists();

        this.userService.optionLists.subscribe((data) => {
            this.isLoading = false;
            this.optionLists = data;
        });
        this.previousUrl = history.state.previousUrl;
    }

    async retrieveOptionLists() {
        this.isLoading = true;
        try {
            const owner = await this.fetchOwnerData();
            this.owner = owner;
            if (!owner?.id) {
                throw new Error('Owner data is missing');
            }
            this.userService.getUserOptionLists(owner.id)
        } catch (err) {
            console.error('Failed to fetch option lists:', err);
        }
    }

    async fetchOwnerData(): Promise<User | undefined> {
        const userId = this.authenticationService.getCurrentUser()?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }
        return await lastValueFrom(this.userService.getUserById(userId));
    }

    get sortedOptionLists(): OptionList[] {
        return (this.optionLists ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
    }

    onEdit(optionList: OptionList) {
        this.router.navigate(['add-edit-option-lists', optionList.id]);
    }

    async onDelete(optionList: OptionList) {
        const userConfirmed = await this.modalDelOptionList(optionList);

        if (userConfirmed) {
            this.userService.deleteOptionList(optionList.id).subscribe({
                next: (success) => {
                    if (success) {
                        this.retrieveOptionLists();
                    }
                },
                error: (err) => {
                }
            });
        } else {
        }
    }

    onDuplicate(optionList: OptionList) {
        this.router.navigate(['add-edit-option-lists', optionList.id], { queryParams: { duplicate: true } });
    }

    onAdd() {
        this.router.navigate(['add-edit-option-lists']);
    }

    modalDelOptionList(optionList: OptionList): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const dialogRef = this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data: {
                    title: 'Delete Option List',
                    message: `Are you sure you want to delete this option list: ${optionList.name}?`,
                    context: 'editForm'
                }
            });
            
            dialogRef.afterClosed().subscribe((result) => {
                resolve(result);
            });
        });
    }
}
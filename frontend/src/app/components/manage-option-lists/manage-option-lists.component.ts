import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {User} from "../../models/user";
import { OptionList } from '../../models/optionList';
import {lastValueFrom} from "rxjs";

@Component({
    selector: 'app-manage-option-lists',
    templateUrl: './manage-option-lists.component.html',
    styleUrl: './manage-option-lists.component.css'
})
export class ManageOptionsListComponent implements OnInit {
    owner?: User;
    optionLists: OptionList[] = [];

    backButtonVisible: boolean = true;
    
    constructor(private router: Router, private _location: Location, private authenticationService: AuthenticationService,
                private userService: UserService) {
    }
    
    ngOnInit() {
        this.retrieveOptionLists();
    }


    async retrieveOptionLists() {
        try {
            const owner = await this.fetchOwnerData();
            this.owner = owner;
            if (!owner?.id) {
                throw new Error('Owner data is missing');
            }
            this.optionLists = await lastValueFrom(this.userService.getUserOptionLists(owner.id));
            console.log(this.optionLists);
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

    onDelete(optionList: OptionList) {
        console.log('Delete clicked for:', optionList);
    }

    onDuplicate(optionList: OptionList) {
        this.router.navigate(['add-edit-option-lists', optionList.id]);
    }

    onAdd() {
        this.router.navigate(['add-edit-option-lists']);
    }
}
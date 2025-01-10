import {UserFormAccess} from "./userFormAccess";
import {Answer} from "./answer";

export enum Role {
    Admin=2,
    User=1,
    Guest=0
}

export class User {
    id: number = 0;
    email?: string = '';
    firstName?: string = '';
    lastName?: string = '';
    fullName: string = '';
    password?: string = '';
    token?: string;
    role: Role = Role.User;
    refreshToken?: string;
    
    listUserAccesses: UserFormAccess[] = [];

    toString(): string {
        return this.fullName;
    }

    public get roleAsString(): string {
        return Role[this.role];
    }

    constructor(data: any) {
        this.id = data.id;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.fullName = data.fullName;
        this.password = data.password;
        this.token = data.token;
        this.role = data.role;
        this.refreshToken = data.refreshToken;

        this.listUserAccesses = data.formAccesses ? data.formAccesses.map((fa : UserFormAccess) => new UserFormAccess(fa)) : [];
    }
}
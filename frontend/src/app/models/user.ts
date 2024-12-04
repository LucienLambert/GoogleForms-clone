export enum Role {
    Admin=2,
    User=1,
    Guest=0
}

export class User {
    id: number = 0;
    email?: string = '';
    firstName: string = '';
    lastName: string = '';
    fullName: string = '';
    password?: string = '';
    token?: string;
    role: Role = Role.User;
    refreshToken?: string;

    toString(): string {
        return this.fullName;
    }

    public get roleAsString(): string {
        return Role[this.role];
    }
}
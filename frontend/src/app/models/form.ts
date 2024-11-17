import { User } from "oidc-client";

export class Form {
    title: string;
    description?: string | null; //dans le cas ou la description peut-être null
    owner: User;
    isPublic: boolean;

    constructor(data: any) {
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.isPublic = data.isPublic;
    }
}
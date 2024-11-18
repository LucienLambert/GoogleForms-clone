export class Form {
    id: number;
    title: string;
    description?: string | null; //dans le cas ou la description peut-être null
    isPublic: boolean;
    owner: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.isPublic = data.isPublic;
    }
}
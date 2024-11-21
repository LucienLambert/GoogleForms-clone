export class Instance {

    id: number;
    started: Date;
    completed?: Date;

    form: {
        id: number;
        title: string;
        description: string;
        ownerId: number;
    };

    owner: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    constructor(data: any) {
        this.id = data.id;
        this.started = data.started;
        this.completed = data.completed;
        this.form= data.form;
        this.owner = data.owner;
    }
}
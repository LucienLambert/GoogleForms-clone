import { Instance } from "./instance";
import { User } from "./user";
import { Question } from "./question";
import { UserFormAccess } from "./userFormAccess";


export class Form {
    id: number;
    title: string;
    description?: string | null;
    isPublic: boolean;
    ownerId: number;
    owner: User;
    listInstance: Instance [];
    listQuestion: Question [];
    listUserFormAccess: UserFormAccess [];


    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.ownerId = data.ownerId;
        this.isPublic = data.isPublic;
        this.listInstance = data.listInstances ? data.listInstances.map( (i: Instance) => new Instance(i)) : [];
        this.listQuestion = data.listQuestions ? data.listQuestions.map( (q: Question) => new Question(q)) : [];
        this.listUserFormAccess = data.listUserFormAccesses ? data.listUserFormAccesses.map( (ufa: UserFormAccess) => new UserFormAccess(ufa)) : [];
    
    }
}
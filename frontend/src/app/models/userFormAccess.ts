export enum AccesType {
    User,
    Editor
}

export class UserFormAccess {
    userId: number;
    formId: number;
    accesType: AccesType;


    constructor(data: any) {
        this.userId = data.userId;
        this.formId = data.formId;
        this.accesType = data.accesType;
    }
}
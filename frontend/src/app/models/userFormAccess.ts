export enum AccessType {
    User,
    Editor
}

export class UserFormAccess {
    userId: number;
    formId: number;
    accessType: AccessType;


    constructor(data: any) {
        this.userId = data.userId;
        this.formId = data.formId;
        this.accessType = data.accessType;
    }
}
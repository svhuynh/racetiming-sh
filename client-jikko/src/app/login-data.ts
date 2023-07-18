export class Role {
    eventId: number = null;
    name: string = '';
    redirectPath = '';
    hasFullAccess = false;
    authorizedPages: string[] = [];

    constructor(role: Role = null) {
        if (role != null) {
            this.eventId = role.eventId;
            this.name = role.name;
            this.redirectPath = role.redirectPath;
            this.hasFullAccess = role.hasFullAccess;
            this.authorizedPages = role.authorizedPages;
        }
    }

    public setIds(roleId: number, eventId: number): void {
        this.eventId = eventId;
        switch(roleId) {
            case 1:
                this.name = 'Administrateur';
                this.redirectPath = 'app/events';
                this.hasFullAccess = true;
                break;
            case 2:
                this.name = 'Chronométreur';
                this.redirectPath = 'app/events';
                this.hasFullAccess = true;
                break;
            case 3:
                this.name = 'Organisateur';
                this.redirectPath = 'app/participants/' + this.eventId;
                this.authorizedPages = ['participants'];
                break;
            case 4:
                this.name = 'Annonceur';
                this.redirectPath = 'app/announcer/' + this.eventId;
                this.authorizedPages = ['announcer'];
                break;
        }
    }

    public canActivate(page: string, eventId: number): boolean {
        return this.hasFullAccess || (this.authorizedPages.indexOf(page) >= 0 && eventId == this.eventId);
    }
}

export class LoginData {
    token: string = '';
    role: Role = null;

    constructor(token: string, roleId: number, eventId: number = 0) {
        this.token = token;
        this.role = new Role;
        this.role.setIds(roleId, eventId);
    }
}
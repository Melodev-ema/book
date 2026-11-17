export interface ApiTokenEntityInterface {
    id: string
    name: string
    token: string
    revokedAt: Date | null
    revoked: boolean
    createdAt: Date
}

export class ApiTokenEntity implements ApiTokenEntityInterface {
    id: string;
    name: string;
    token: string;
    revokedAt: Date | null;
    revoked: boolean;
    createdAt: Date;

    constructor(data: ApiTokenEntity) {
        this.id = data.id;
        this.name = data.name;
        this.token = data.token;
        this.revokedAt = data.revokedAt;
        this.revoked = data.revoked;
        this.createdAt = data.createdAt;
    }
}

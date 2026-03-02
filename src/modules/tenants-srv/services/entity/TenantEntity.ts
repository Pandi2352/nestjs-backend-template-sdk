import { IAuthConfigs } from "../db/AuthConfigs";

export class TenantEntity {
    tenant_key: string = "";
    name: string = "";
    allowed_domains: string[] = [];
    auth_config: any | any[] = {} as IAuthConfigs;
}


//Cloud Flare Record DNS
export class CloudFlareDNS {
    name: string[]= [];
    comment: string = "";
}
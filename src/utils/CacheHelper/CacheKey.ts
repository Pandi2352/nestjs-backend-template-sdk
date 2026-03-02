import { ErrorEntity, HttpStatus } from "../core/CodeUtils";



export class CacheKey {
   
    static sweet_service = "sweet_service";
    

    static validate(val: string) {
        const vals_allowed = Object.values(CacheKey);
        if (!vals_allowed.find(c => c.toLowerCase() == val.toLowerCase())) {
            throw new ErrorEntity({ http_code: HttpStatus.EXPECTATION_FAILED, error: "invalid_request", error_description: "given client_owner is not supported, supported values : " + vals_allowed.join(",") });
        }
    }
}
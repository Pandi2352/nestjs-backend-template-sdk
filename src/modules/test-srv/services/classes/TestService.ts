import { ErrorEntity, HttpStatus, LoggerHelper, RequestContext } from "../../../../utils/core/CodeUtils";

export class TestService {
    private static _instance: TestService;
    static get Instance() {
        if (!this._instance) {
            this._instance = new TestService();
        }
        return this._instance;
    }

    async testService(currentContext: RequestContext) {
        try {
            const test = { name: "testService" };
            LoggerHelper.Instance.info(currentContext.x_request_id, "testService fn", { test });

            return Promise.resolve(true);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in testService fn", error);
            return Promise.reject(error);
        }
    }
}
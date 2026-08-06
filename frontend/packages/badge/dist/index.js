import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABVNjb3JlAAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbEJhZGdlcwA=",
            "AAAAAAAAACxSZXR1cm5zIGEgd2FsbGV0J3MgY3VycmVudCByZXB1dGF0aW9uIHNjb3JlLgAAAAVzY29yZQAAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAQ=",
            "AAAAAAAAADtSZWNvcmRzIHJlcHV0YXRpb24gZm9yIGEgd2FsbGV0IGJhc2VkIG9uIGNoZWNrLWluIGFjdGl2aXR5LgAAAAAGcmVjb3JkAAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAIY2hlY2tpbnMAAAAEAAAAAAAAAA50b3RhbF9jaGVja2lucwAAAAAABAAAAAEAAAAE",
            "AAAABQAAAAAAAAAAAAAADEJhZGdlVXBkYXRlZAAAAAEAAAANYmFkZ2VfdXBkYXRlZAAAAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAQAAAAAAAAAFc2NvcmUAAAAAAAAEAAAAAAAAAAAAAAAMdG90YWxfYmFkZ2VzAAAABAAAAAAAAAAB",
            "AAAAAAAAADRSZXR1cm5zIHRoZSBudW1iZXIgb2Ygd2FsbGV0cyB3aXRoIGEgcmVjb3JkZWQgYmFkZ2UuAAAADHRvdGFsX2JhZGdlcwAAAAAAAAABAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        score: (this.txFromJSON),
        record: (this.txFromJSON),
        total_badges: (this.txFromJSON)
    };
}

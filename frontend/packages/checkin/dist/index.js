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
        contractId: "CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5",
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
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAABFVzZXIAAAABAAAAEwAAAAAAAAAAAAAABVRvdGFsAAAAAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAA1CYWRnZUNvbnRyYWN0AAAA",
            "AAAABQAAAAAAAAAAAAAAB0NoZWNrSW4AAAAAAQAAAAhjaGVja19pbgAAAAQAAAAAAAAABHVzZXIAAAATAAAAAQAAAAAAAAAKdXNlcl9jb3VudAAAAAAABAAAAAAAAAAAAAAAC3RvdGFsX2NvdW50AAAAAAQAAAAAAAAAAAAAAAtiYWRnZV9zY29yZQAAAAAEAAAAAAAAAAE=",
            "AAAABQAAAAAAAAAAAAAAC0JhZGdlTGlua2VkAAAAAAEAAAAMYmFkZ2VfbGlua2VkAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAAAAAAAAOYmFkZ2VfY29udHJhY3QAAAAAABMAAAAAAAAAAQ==",
            "AAAAAAAAADBSZXR1cm5zIGFsbCBjaGVjay1pbnMgcmVjb3JkZWQgYnkgdGhpcyBjb250cmFjdC4AAAAFdG90YWwAAAAAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAElSZWNvcmRzIGFuIGF1dGhlbnRpY2F0ZWQgd2FsbGV0IGNoZWNrLWluIGFuZCByZXR1cm5zIHRoYXQgd2FsbGV0J3MgY291bnQuAAAAAAAACGNoZWNrX2luAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
            "AAAAAAAAAC9SZXR1cm5zIGhvdyBtYW55IHRpbWVzIGEgd2FsbGV0IGhhcyBjaGVja2VkIGluLgAAAAAJZ2V0X2NvdW50AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
            "AAAAAAAAAEBSZXR1cm5zIHRoZSBsaW5rZWQgYmFkZ2UgY29udHJhY3QgYWRkcmVzcywgaWYgb25lIGlzIGNvbmZpZ3VyZWQuAAAADmJhZGdlX2NvbnRyYWN0AAAAAAAAAAAAAQAAA+gAAAAT",
            "AAAAAAAAAEtMaW5rcyBhIHJlcHV0YXRpb24gYmFkZ2UgY29udHJhY3QgdGhhdCB3aWxsIGJlIGNhbGxlZCBhZnRlciBldmVyeSBjaGVjay1pbi4AAAAAD2NvbmZpZ3VyZV9iYWRnZQAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADmJhZGdlX2NvbnRyYWN0AAAAAAATAAAAAQAAABM="]), options);
        this.options = options;
    }
    fromJSON = {
        total: (this.txFromJSON),
        check_in: (this.txFromJSON),
        get_count: (this.txFromJSON),
        badge_contract: (this.txFromJSON),
        configure_badge: (this.txFromJSON)
    };
}

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
        contractId: "CATRUM6EPBPN2475AO42CXU7TDDUZ2TGFS2IY3QOQY5JB53I3HWIDO44",
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
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABFVzZXIAAAABAAAAEwAAAAAAAAAAAAAABVRvdGFsAAAA",
            "AAAAAAAAADBSZXR1cm5zIGFsbCBjaGVjay1pbnMgcmVjb3JkZWQgYnkgdGhpcyBjb250cmFjdC4AAAAFdG90YWwAAAAAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAElSZWNvcmRzIGFuIGF1dGhlbnRpY2F0ZWQgd2FsbGV0IGNoZWNrLWluIGFuZCByZXR1cm5zIHRoYXQgd2FsbGV0J3MgY291bnQuAAAAAAAACGNoZWNrX2luAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
            "AAAAAAAAAC9SZXR1cm5zIGhvdyBtYW55IHRpbWVzIGEgd2FsbGV0IGhhcyBjaGVja2VkIGluLgAAAAAJZ2V0X2NvdW50AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        total: (this.txFromJSON),
        check_in: (this.txFromJSON),
        get_count: (this.txFromJSON)
    };
}

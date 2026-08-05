import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
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
} as const

export type DataKey = {tag: "User", values: readonly [string]} | {tag: "Total", values: void} | {tag: "Admin", values: void} | {tag: "BadgeContract", values: void};



export interface Client {
  /**
   * Construct and simulate a total transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns all check-ins recorded by this contract.
   */
  total: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a check_in transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Records an authenticated wallet check-in and returns that wallet's count.
   */
  check_in: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns how many times a wallet has checked in.
   */
  get_count: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a badge_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the linked badge contract address, if one is configured.
   */
  badge_contract: (options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a configure_badge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Links a reputation badge contract that will be called after every check-in.
   */
  configure_badge: ({admin, badge_contract}: {admin: string, badge_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAABFVzZXIAAAABAAAAEwAAAAAAAAAAAAAABVRvdGFsAAAAAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAA1CYWRnZUNvbnRyYWN0AAAA",
        "AAAABQAAAAAAAAAAAAAAB0NoZWNrSW4AAAAAAQAAAAhjaGVja19pbgAAAAQAAAAAAAAABHVzZXIAAAATAAAAAQAAAAAAAAAKdXNlcl9jb3VudAAAAAAABAAAAAAAAAAAAAAAC3RvdGFsX2NvdW50AAAAAAQAAAAAAAAAAAAAAAtiYWRnZV9zY29yZQAAAAAEAAAAAAAAAAE=",
        "AAAABQAAAAAAAAAAAAAAC0JhZGdlTGlua2VkAAAAAAEAAAAMYmFkZ2VfbGlua2VkAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAAAAAAAAOYmFkZ2VfY29udHJhY3QAAAAAABMAAAAAAAAAAQ==",
        "AAAAAAAAADBSZXR1cm5zIGFsbCBjaGVjay1pbnMgcmVjb3JkZWQgYnkgdGhpcyBjb250cmFjdC4AAAAFdG90YWwAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAElSZWNvcmRzIGFuIGF1dGhlbnRpY2F0ZWQgd2FsbGV0IGNoZWNrLWluIGFuZCByZXR1cm5zIHRoYXQgd2FsbGV0J3MgY291bnQuAAAAAAAACGNoZWNrX2luAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
        "AAAAAAAAAC9SZXR1cm5zIGhvdyBtYW55IHRpbWVzIGEgd2FsbGV0IGhhcyBjaGVja2VkIGluLgAAAAAJZ2V0X2NvdW50AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
        "AAAAAAAAAEBSZXR1cm5zIHRoZSBsaW5rZWQgYmFkZ2UgY29udHJhY3QgYWRkcmVzcywgaWYgb25lIGlzIGNvbmZpZ3VyZWQuAAAADmJhZGdlX2NvbnRyYWN0AAAAAAAAAAAAAQAAA+gAAAAT",
        "AAAAAAAAAEtMaW5rcyBhIHJlcHV0YXRpb24gYmFkZ2UgY29udHJhY3QgdGhhdCB3aWxsIGJlIGNhbGxlZCBhZnRlciBldmVyeSBjaGVjay1pbi4AAAAAD2NvbmZpZ3VyZV9iYWRnZQAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADmJhZGdlX2NvbnRyYWN0AAAAAAATAAAAAQAAABM=" ]),
      options
    )
  }
  public readonly fromJSON = {
    total: this.txFromJSON<u32>,
        check_in: this.txFromJSON<u32>,
        get_count: this.txFromJSON<u32>,
        badge_contract: this.txFromJSON<Option<string>>,
        configure_badge: this.txFromJSON<string>
  }
}
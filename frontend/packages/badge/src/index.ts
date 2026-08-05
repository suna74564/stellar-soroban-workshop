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
    contractId: "CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ",
  }
} as const

export type DataKey = {tag: "Score", values: readonly [string]} | {tag: "TotalBadges", values: void};


export interface Client {
  /**
   * Construct and simulate a score transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns a wallet's current reputation score.
   */
  score: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a record transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Records reputation for a wallet based on check-in activity.
   */
  record: ({user, checkins, total_checkins}: {user: string, checkins: u32, total_checkins: u32}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a total_badges transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the number of wallets with a recorded badge.
   */
  total_badges: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABVNjb3JlAAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbEJhZGdlcwA=",
        "AAAAAAAAACxSZXR1cm5zIGEgd2FsbGV0J3MgY3VycmVudCByZXB1dGF0aW9uIHNjb3JlLgAAAAVzY29yZQAAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAQ=",
        "AAAAAAAAADtSZWNvcmRzIHJlcHV0YXRpb24gZm9yIGEgd2FsbGV0IGJhc2VkIG9uIGNoZWNrLWluIGFjdGl2aXR5LgAAAAAGcmVjb3JkAAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAIY2hlY2tpbnMAAAAEAAAAAAAAAA50b3RhbF9jaGVja2lucwAAAAAABAAAAAEAAAAE",
        "AAAABQAAAAAAAAAAAAAADEJhZGdlVXBkYXRlZAAAAAEAAAANYmFkZ2VfdXBkYXRlZAAAAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAQAAAAAAAAAFc2NvcmUAAAAAAAAEAAAAAAAAAAAAAAAMdG90YWxfYmFkZ2VzAAAABAAAAAAAAAAB",
        "AAAAAAAAADRSZXR1cm5zIHRoZSBudW1iZXIgb2Ygd2FsbGV0cyB3aXRoIGEgcmVjb3JkZWQgYmFkZ2UuAAAADHRvdGFsX2JhZGdlcwAAAAAAAAABAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    score: this.txFromJSON<u32>,
        record: this.txFromJSON<u32>,
        total_badges: this.txFromJSON<u32>
  }
}
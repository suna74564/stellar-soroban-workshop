import { Address } from "@stellar/stellar-base";
import { Server } from "@stellar/stellar-sdk/rpc";
import type { Api } from "@stellar/stellar-sdk/rpc";
import type { xdr } from "@stellar/stellar-base";
import { CHECKIN_CONTRACT_ID, RPC_URL } from "./checkin";
import type { CheckinEvent } from "../types";

const EVENT_LEDGER_LOOKBACK = 200;
const EVENT_LIMIT = 20;

let server: Server | null = null;

function getServer() {
  server ??= new Server(RPC_URL, {
    allowHttp: RPC_URL.startsWith("http://"),
    timeout: 15000,
  });

  return server;
}

function readSymbol(value: xdr.ScVal) {
  if (value.switch().name !== "scvSymbol") return "";
  return value.sym().toString();
}

function readAddress(value: xdr.ScVal) {
  if (value.switch().name !== "scvAddress") return "";
  return Address.fromScVal(value).toString();
}

function readU32(value: xdr.ScVal) {
  if (value.switch().name !== "scvU32") return 0;
  return Number(value.u32());
}

function parseCheckinEvent(event: Api.EventResponse): CheckinEvent | null {
  const [nameTopic, userTopic] = event.topic;
  const eventName = nameTopic ? readSymbol(nameTopic) : "";

  if (eventName !== "check_in" || !userTopic) return null;

  const values = event.value.vec();
  if (!values || values.length < 2) return null;

  const user = readAddress(userTopic);
  if (!user) return null;

  return {
    id: event.id,
    ledger: event.ledger,
    closedAt: event.ledgerClosedAt,
    txHash: event.txHash,
    user,
    userCount: readU32(values[0]),
    totalCount: readU32(values[1]),
  };
}

export async function fetchCheckinEvents(cursor?: string) {
  const rpcServer = getServer();
  const filters = [
    {
      type: "contract" as const,
      contractIds: [CHECKIN_CONTRACT_ID],
    },
  ];

  const request = cursor
    ? {
        cursor,
        filters,
        limit: EVENT_LIMIT,
      }
    : {
        startLedger: Math.max(
          1,
          (await rpcServer.getLatestLedger()).sequence - EVENT_LEDGER_LOOKBACK,
        ),
        filters,
        limit: EVENT_LIMIT,
      };

  const response = await rpcServer.getEvents(request);
  const events = response.events
    .map(parseCheckinEvent)
    .filter((event): event is CheckinEvent => Boolean(event))
    .sort((a, b) => b.ledger - a.ledger || b.id.localeCompare(a.id));

  return {
    events,
    cursor: response.cursor,
    latestLedger: response.latestLedger,
  };
}

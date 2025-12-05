import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { addRxPlugin } from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { createRxDatabase } from "rxdb/plugins/core";

addRxPlugin(RxDBDevModePlugin);

let storage = getRxStorageDexie();
storage = wrappedValidateAjvStorage({ storage }) as ReturnType<
  typeof getRxStorageDexie
>;

export const connectDatabase = await createRxDatabase({
  name: "connect_db",
  storage: storage,
});

await connectDatabase.addCollections({
  // name of the collection
  messages: {
    // we use the JSON-schema standard
    schema: {
      version: 0,
      primaryKey: "id",
      type: "object",
      properties: {
        id: {
          type: "string",
          maxLength: 100,
        },
        chatId: {
          type: "string",
        },
        user: {
          type: "object",
          properties: {
            id: {
              type: "string",
              maxLength: 100,
            },
            name: {
              type: "string",
              maxLength: 100,
            },
          },
        },
        content: {
          type: "string",
        },
        messageType: {
          type: "string",
        },
        status: {
          type: "string",
        },
        retries: {
          type: "number",
        },
        file: {
          type: "string",
        },
        fileToUpload: {
          type: "string",
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
      },
      required: ["id", "chatId", "messageType", "status", "createdAt"],
    },
  },
});

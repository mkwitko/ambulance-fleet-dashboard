export const AblyEvents = {
  messages: "messages",
  status: "status",
  readChat: "readChat",
  shiftStatus: "shiftStatus",
} as const;

export type AblyEvents = keyof typeof AblyEvents;

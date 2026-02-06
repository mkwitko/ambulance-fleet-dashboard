import { getGetCommsUsersQueryKey } from "@/http/generated/comms-user/comms-user";
import type { GetCommsUsers200 } from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export const updateCommsActivenessResponse = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetCommsUsers200>(
    {
      predicate: (query) => query.queryKey[0] === getGetCommsUsersQueryKey()[0],
    },
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((user) =>
          user.id === incomingMessage.data.userId
            ? { ...user, active: incomingMessage.data.active }
            : user,
        ),
      };
    },
  );
};

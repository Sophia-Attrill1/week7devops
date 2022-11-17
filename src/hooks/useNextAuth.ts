import {useSession} from "next-auth/react";

let session = useSession;

if (process.env.NEXT_PUBLIC_TESTING) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  session = () => ({data: {session: true}});
}

export default session;

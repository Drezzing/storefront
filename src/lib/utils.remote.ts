import { query } from "$app/server";

// Remote functions currently invalidate load function if no refresh is specified,
// this helper forces an empty refresh so load function isn't re-run
export const dummyQuery = query(() => {});

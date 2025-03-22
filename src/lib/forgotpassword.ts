import { z } from "zod";

export const forgotpasswordObject = z.object({
    email: z.string().email(),
});
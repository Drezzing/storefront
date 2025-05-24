import type {
    AdapterOptions,
    ClientValidationAdapter,
    ValidationAdapter,
    ValidationResult,
} from "sveltekit-superforms/adapters";
import { createAdapter } from "sveltekit-superforms/adapters";

import { z } from "zod/v4-mini";
import type { $ZodErrorMap, $ZodIssue } from "zod/v4/core";

export const zod4MiniValidate = async <T extends z.ZodMiniType>(
    schema: T,
    data: unknown,
    error: $ZodErrorMap<$ZodIssue> | undefined,
): Promise<ValidationResult<z.output<T>>> => {
    const result = await schema.safeParseAsync(data, { error });
    if (result.success) {
        return {
            data: result.data as z.infer<T>,
            success: true,
        };
    }

    return {
        issues: result.error.issues.map(({ message, path }) => ({ message, path })),
        success: false,
    };
};

export const zod4Mini = <T extends z.ZodMiniType>(
    schema: T,
    options?: AdapterOptions<z.output<T>> & { error?: $ZodErrorMap<$ZodIssue> },
): ValidationAdapter<z.output<T>, z.input<T>> => {
    return createAdapter({
        superFormValidationLibrary: "custom",
        validate: async (data: unknown) => {
            return zod4MiniValidate(schema, data, options?.error);
        },
        // @ts-expect-error not same type, but should be close enougth to not cause issues
        jsonSchema: options?.jsonSchema ?? z.toJSONSchema(schema, { target: "draft-7" }),
        defaults: options?.defaults,
    });
};

export const zod4MiniClient = <T extends z.ZodMiniType>(
    schema: T,
    options?: { error: $ZodErrorMap<$ZodIssue> },
): ClientValidationAdapter<z.input<T>, z.output<T>> => {
    return {
        superFormValidationLibrary: "custom",
        validate: async (data) => zod4MiniValidate(schema, data, options?.error),
    };
};

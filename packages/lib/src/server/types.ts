import {
  DocumentByName,
  FunctionReference,
  GenericDataModel,
  internalMutationGeneric,
  RegisteredAction,
  RegisteredMutation,
  RegisteredQuery,
  TableNamesInDataModel,
} from "convex/server";
import { GenericId, Infer, Validator } from "convex/values";

import { storeImplementation, StoreInputValidator } from "./store";

export interface InternalConfiguration {
  stripe: {
    secret_key: string;
    webhook_secret: string;
    publishable_key: string;
  };

  convex: { projectId: string };

  store: any;
}

export type WithOptional<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<InternalConfiguration, "store">;

export type ArgSchema = Record<
  string,
  Validator<any, "optional" | "required", any>
>;
export type InferArgs<S extends ArgSchema> = { [K in keyof S]: Infer<S[K]> };

/**
 * Convex document from a given table.
 */
export type GenericDoc<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>,
> = DocumentByName<DataModel, TableName> & {
  _id: GenericId<TableName>;
  _creationTime: number;
};

const store = internalMutationGeneric({
  args: StoreInputValidator,
  handler: async (context, args) =>
    await storeImplementation.handler(
      context,
      args,
      "configuration" as any as InternalConfiguration
    ),
});

export type StoreImplementation = FunctionReferenceFromExport<typeof store>;

/**
 * @internal
 */
export type FunctionReferenceFromExport<Export> =
  Export extends RegisteredQuery<infer Visibility, infer Args, infer Output>
    ? FunctionReference<"query", Visibility, Args, ConvertReturnType<Output>>
    : Export extends RegisteredMutation<
          infer Visibility,
          infer Args,
          infer Output
        >
      ? FunctionReference<
          "mutation",
          Visibility,
          Args,
          ConvertReturnType<Output>
        >
      : Export extends RegisteredAction<
            infer Visibility,
            infer Args,
            infer Output
          >
        ? FunctionReference<
            "action",
            Visibility,
            Args,
            ConvertReturnType<Output>
          >
        : never;

type ConvertReturnType<T> = UndefinedToNull<Awaited<T>>;

type UndefinedToNull<T> = T extends void ? null : T;

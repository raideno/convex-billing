import {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
} from "convex/server";
import { GenericId, Infer, Validator } from "convex/values";

import { Logger } from "./logger";
import { billingTables } from "./schema";

export interface InternalConfiguration {
  stripe: {
    secret_key: string;
    webhook_secret: string;
  };

  sync: Partial<Record<keyof typeof billingTables, boolean>>;

  debug: boolean;

  logger: Logger;

  base: string;
}

export type WithOptional<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<
  InternalConfiguration,
  "base" | "debug" | "logger" | "sync"
>;

export type ArgSchema = Record<
  string,
  Validator<any, "optional" | "required", any>
>;

export type InferArgs<S extends ArgSchema> = {
  [K in keyof S as S[K] extends Validator<any, "required", any>
    ? K
    : never]: Infer<S[K]>;
} & {
  [K in keyof S as S[K] extends Validator<any, "optional", any>
    ? K
    : never]?: Infer<S[K]>;
};

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

import {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
} from "convex/server";
import { GenericId, Infer, Validator } from "convex/values";
import { Logger } from "./logger";

export interface InternalConfiguration {
  stripe: {
    secret_key: string;
    webhook_secret: string;
  };

  debug: boolean;

  logger: Logger;

  base: string;
}

export type WithOptional<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<
  InternalConfiguration,
  "base" | "debug" | "logger"
>;

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

import {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
} from "convex/server";
import { GenericId, Infer, Validator } from "convex/values";

export interface InternalConfiguration {
  stripe: {
    secret_key: string;
    webhook_secret: string;
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

import type { WithoutSystemFields } from "convex/server";
import type { GenericId } from "convex/values";

type DocOf<M, T extends keyof M> = M[T] extends { document: infer D }
  ? D
  : never;

type Keys<D> = Extract<keyof D, string>;
type Operation =
  | "upsert"
  | "deleteById"
  | "selectOne"
  | "selectById"
  | "selectAll";

type UpsertArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    operation: "upsert";
    table: T;
    idField: K;
    // @ts-ignore
    data: WithoutSystemFields<DocOf<M, T>> & Record<K, DocOf<M, T>[K]>;
  };
}[Keys<DocOf<M, T>>];

type DeleteByIdArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    operation: "deleteById";
    table: T;
    idField: K;
    idValue: DocOf<M, T>[K];
  };
}[Keys<DocOf<M, T>>];

type SelectOneArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    operation: "selectOne";
    table: T;
    field: K;
    value: DocOf<M, T>[K];
  };
}[Keys<DocOf<M, T>>];

type SelectByIdArgsFor<M, T extends keyof M & string> = {
  operation: "selectById";
  table: T;
  id: GenericId<T>;
};

type SelectAllArgsFor<M, T extends keyof M> = {
  operation: "selectAll";
  table: T;
};

export type StoreArgsFor<
  M,
  //   T extends keyof M,
  T extends keyof M & string,
  O extends Operation = Operation,
> = O extends "upsert"
  ? UpsertArgsFor<M, T>
  : O extends "deleteById"
    ? DeleteByIdArgsFor<M, T>
    : O extends "selectOne"
      ? SelectOneArgsFor<M, T>
      : O extends "selectById"
        ? SelectByIdArgsFor<M, T>
        : O extends "selectAll"
          ? SelectAllArgsFor<M, T>
          : never;

export type StoreDispatchArgs<M> = {
  [T in Extract<keyof M, string>]:
    | UpsertArgsFor<M, T>
    | DeleteByIdArgsFor<M, T>
    | SelectOneArgsFor<M, T>
    | SelectByIdArgsFor<M, T>
    | SelectAllArgsFor<M, T>;
}[Extract<keyof M, string>];

export type StoreResultFor<M, A extends StoreDispatchArgs<M>> = A extends {
  operation: "upsert";
  table: infer T extends keyof M & string;
}
  ? { id: GenericId<T> }
  : A extends { operation: "deleteById" }
    ? { deleted: boolean }
    : A extends { operation: "selectOne"; table: infer T extends keyof M }
      ? { doc: DocOf<M, T> | null }
      : A extends { operation: "selectById"; table: infer T extends keyof M }
        ? { doc: DocOf<M, T> | null }
        : A extends { operation: "selectAll"; table: infer T extends keyof M }
          ? { docs: DocOf<M, T>[] }
          : never;

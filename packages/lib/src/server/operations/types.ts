import type { WithoutSystemFields } from "convex/server";
import type { GenericId } from "convex/values";

type DocOf<M, T extends keyof M> = M[T] extends { document: infer D }
  ? D
  : never;

type Keys<D> = Extract<keyof D, string>;
type Op = "upsert" | "deleteById" | "selectOne" | "selectById" | "selectAll";

type UpsertArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    op: "upsert";
    table: T;
    idField: K;
    // @ts-ignore
    data: WithoutSystemFields<DocOf<M, T>> & Record<K, DocOf<M, T>[K]>;
  };
}[Keys<DocOf<M, T>>];

type DeleteByIdArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    op: "deleteById";
    table: T;
    idField: K;
    idValue: DocOf<M, T>[K];
  };
}[Keys<DocOf<M, T>>];

type SelectOneArgsFor<M, T extends keyof M> = {
  [K in Keys<DocOf<M, T>>]: {
    op: "selectOne";
    table: T;
    field: K;
    value: DocOf<M, T>[K];
  };
}[Keys<DocOf<M, T>>];

type SelectByIdArgsFor<M, T extends keyof M & string> = {
  op: "selectById";
  table: T;
  id: GenericId<T>;
};

type SelectAllArgsFor<M, T extends keyof M> = {
  op: "selectAll";
  table: T;
};

export type BillingArgsFor<
  M,
  //   T extends keyof M,
  T extends keyof M & string,
  O extends Op = Op,
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

export type BillingDispatchArgs<M> = {
  [T in Extract<keyof M, string>]:
    | UpsertArgsFor<M, T>
    | DeleteByIdArgsFor<M, T>
    | SelectOneArgsFor<M, T>
    | SelectByIdArgsFor<M, T>
    | SelectAllArgsFor<M, T>;
}[Extract<keyof M, string>];

export type BillingResultFor<M, A extends BillingDispatchArgs<M>> = A extends {
  op: "upsert";
  table: infer T extends keyof M & string;
}
  ? { id: GenericId<T> }
  : A extends { op: "deleteById" }
    ? { deleted: boolean }
    : A extends { op: "selectOne"; table: infer T extends keyof M }
      ? { doc: DocOf<M, T> | null }
      : A extends { op: "selectById"; table: infer T extends keyof M }
        ? { doc: DocOf<M, T> | null }
        : A extends { op: "selectAll"; table: infer T extends keyof M }
          ? { docs: DocOf<M, T>[] }
          : never;

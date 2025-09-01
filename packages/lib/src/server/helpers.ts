import { Context, Persistence } from "./persistence/types";

export interface InternalConfiguration {
  persistence: Persistence;

  stripe: {
    secret_key: string;
    webhook_secret: string;
    publishable_key: string;
  };

  convex: { projectId: string };
}

export type WithOptional<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<InternalConfiguration>;

export const normalizeConfiguration = (
  config: InputConfiguration
): InternalConfiguration => {
  return {
    ...config,
  };
};

export type Implementation<T extends Record<string, any>, R> = (
  context: Context,
  args: T,
  configuration: InternalConfiguration
) => R;

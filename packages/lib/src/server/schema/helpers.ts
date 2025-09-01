import { v } from "convex/values";

export const nullablestring = () => v.union(v.string(), v.null());
export const nullableboolean = () => v.union(v.boolean(), v.null());
export const nullablenumber = () => v.union(v.number(), v.null());
export const metadata = () => v.record(v.string(), v.any());

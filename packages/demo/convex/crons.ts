import { cronJobs } from "convex/server";
import { billing } from "./billing";

const crons = cronJobs();

billing.addCronJobs(crons);

export default crons;

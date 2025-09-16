import { cronJobs } from "convex/server";
import { stripe } from "./stripe";

const crons = cronJobs();

stripe.addCronJobs(crons);

export default crons;

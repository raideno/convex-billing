// TODO: they way they manage this in convexAuth is by creating a store general mutation that calls different other types of mutation using a switch statement adn it receives a type in the args.
// TODO: this mutation serves both as a mutation and modifies the db but also as a query and fetches data from the created tables.

// import { Implementation } from "../helpers";

// export const storeImplementation: Implementation<{
//   type: string;
// }> = async (context, args, configuration) => {
//   switch (args.type) {
//     case "...":
//       break;

//     default:
//       break;
//   }
// };

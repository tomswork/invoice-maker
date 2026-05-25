/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as australian_tax from "../australian_tax.js";
import type * as business from "../business.js";
import type * as calendar_dates from "../calendar_dates.js";
import type * as clients from "../clients.js";
import type * as contracts from "../contracts.js";
import type * as invoice_dates from "../invoice_dates.js";
import type * as invoices from "../invoices.js";
import type * as migrations from "../migrations.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  australian_tax: typeof australian_tax;
  business: typeof business;
  calendar_dates: typeof calendar_dates;
  clients: typeof clients;
  contracts: typeof contracts;
  invoice_dates: typeof invoice_dates;
  invoices: typeof invoices;
  migrations: typeof migrations;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

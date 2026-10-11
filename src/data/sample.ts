import type { Item, Series } from "@/lib/types";
import { updates, explainers } from "./sample-short";
import { rabbitHoles, deepDives, circle } from "./sample-long";
import { macChapters, seriesAll } from "./sample-series";

/** Everything here is clearly marked `sample: true` and shown with a banner in the app. */
export const SAMPLE_ITEMS: Item[] = [
  ...updates, ...explainers, ...rabbitHoles, ...deepDives, ...circle, ...macChapters,
];
export const SAMPLE_SERIES: Series[] = seriesAll;

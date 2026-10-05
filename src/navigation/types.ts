/** A fixed answer for store screenshots (shot mode only). */
export interface Forced {
  index: number;
  page?: number;
  /** Index into the example questions, typed into the question box. */
  q?: number;
}

export type RootStackParamList = {
  Home: { omen?: boolean } | undefined;
  Cauldron: { forced?: Forced } | undefined;
  Book: { forced?: Forced } | undefined;
  Ball: { forced?: Forced } | undefined;
  Journal: undefined;
};

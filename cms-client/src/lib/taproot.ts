import { createTaprootClient } from "@taprootcms/astro";

export const taproot = createTaprootClient({
  url: import.meta.env.TAPROOT_API_URL ?? "http://localhost:4321",
  apiKey: import.meta.env.TAPROOT_API_KEY,
});



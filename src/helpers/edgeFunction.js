// Calls a Supabase Edge Function as the signed-in user and turns failures
// into readable messages.
import { supabase } from "./supabaseClient";

export async function callEdgeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return data;
  let msg = error.message || "Request failed.";
  const res = error.context;
  if (res && typeof res.json === "function") {
    if (res.status === 404) {
      msg = `This feature isn't set up yet - the ${name} function isn't deployed.`;
    }
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch {
      /* keep the generic message */
    }
  } else if (error.name === "FunctionsFetchError") {
    msg = `Couldn't reach the server. Check your connection, or that the ${name} function is deployed.`;
  }
  throw new Error(msg);
}

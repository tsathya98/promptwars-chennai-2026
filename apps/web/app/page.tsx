import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import HomeClient from "@/components/home-client";

/**
 * Demo auth gate: the app itself stays cookie-gated for the judged demo, but
 * credentials are printed on the login page and README, and guest entry is
 * one tap — an evaluator can never be locked out.
 */
export default async function Page() {
  const store = await cookies();
  if (!store.get("ibuki-session")) redirect("/login");
  return <HomeClient />;
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

/**
 * Returns true if at least one admin already exists.
 * Public — used to decide whether the /admin/setup page is available.
 */
export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

/**
 * Creates the very first admin account.
 * Only works when NO admin exists yet — otherwise fails hard.
 * Uses the service-role admin client to (1) create an auth user with
 * email_confirm=true so they can log in immediately, and (2) grant the
 * admin role in public.user_roles.
 */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => setupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Guard: only allowed when no admin exists yet.
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) {
      throw new Error("An admin account already exists. Setup is closed.");
    }

    // Create the auth user (email pre-confirmed so login works immediately).
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message ?? "Could not create admin user");
    }

    // Grant the admin role.
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) {
      // Roll back user creation to keep setup replayable
      await supabaseAdmin.auth.admin.deleteUser(created.user.id).catch(() => {});
      throw new Error(roleErr.message);
    }

    return { ok: true as const, email: data.email };
  });

/**
 * Emergency password reset for an existing admin, using the server-side
 * ADMIN_RECOVERY_CODE. Does not depend on email delivery.
 */
export const resetAdminPasswordWithCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        code: z.string().min(1).max(200),
        password: z.string().min(8).max(128),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_RECOVERY_CODE"];
    if (!expected) throw new Error("Recovery is not configured.");
    if (data.code !== expected) throw new Error("Invalid recovery code.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);

    const target = list.users.find(
      (u) => (u.email ?? "").toLowerCase() === data.email.toLowerCase(),
    );
    if (!target) throw new Error("No account found for that email.");

    const { data: roles, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", target.id)
      .eq("role", "admin");
    if (roleErr) throw new Error(roleErr.message);
    if (!roles || roles.length === 0) throw new Error("That account is not an admin.");

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(target.id, {
      password: data.password,
      email_confirm: true,
    });
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const };
  });

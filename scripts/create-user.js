// Creates or updates a row in the `users` table used by /admin/login.
//
// Usage:
//   USER_PASSWORD='...' node scripts/create-user.js --email you@example.com --name "Your Name" --role admin
//   USER_PASSWORD='...' node scripts/create-user.js --email guest@example.com --name "Guest" --role guest
//
// Pass --reset to overwrite the password of an account that already exists.
//
// The password is read from USER_PASSWORD rather than a flag so it does not
// land in shell history or `ps` output. Requires SUPABASE_SERVICE_ROLE_KEY.

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const ROLES = ["admin", "guest"];
const MIN_PASSWORD_LENGTH = 12;

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    if (!process.env[key]) {
      process.env[key] = trimmed.slice(separator + 1).trim();
    }
  }
}

function parseArgs(argv) {
  const args = { role: "admin", reset: false };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--email":
        args.email = argv[++i];
        break;
      case "--name":
        args.name = argv[++i];
        break;
      case "--role":
        args.role = argv[++i];
        break;
      case "--reset":
        args.reset = true;
        break;
      default:
        throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }

  return args;
}

async function main() {
  loadEnv();

  const args = parseArgs(process.argv.slice(2));
  const password = process.env.USER_PASSWORD;

  if (!args.email) throw new Error("--email is required");
  if (!args.name) throw new Error("--name is required");
  if (!ROLES.includes(args.role)) {
    throw new Error(`--role must be one of: ${ROLES.join(", ")}`);
  }
  if (!password) {
    throw new Error(
      "Set USER_PASSWORD, e.g. USER_PASSWORD='...' node scripts/create-user.js --email ..."
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `USER_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", args.email)
    .maybeSingle();

  if (lookupError) throw new Error(`Lookup failed: ${lookupError.message}`);

  // Cost 12 matches hashPassword() in src/lib/auth.ts
  const password_hash = await bcrypt.hash(password, 12);

  if (existing) {
    if (!args.reset) {
      throw new Error(
        `${args.email} already exists (id=${existing.id}, role=${existing.role}). Pass --reset to overwrite its password.`
      );
    }

    const { error } = await supabase
      .from("users")
      .update({ password_hash, name: args.name, role: args.role })
      .eq("id", existing.id);

    if (error) throw new Error(`Update failed: ${error.message}`);

    console.log(`Updated ${args.email} (id=${existing.id}, role=${args.role})`);
    return;
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({ email: args.email, name: args.name, role: args.role, password_hash })
    .select("id")
    .single();

  if (error) throw new Error(`Insert failed: ${error.message}`);

  console.log(`Created ${args.email} (id=${created.id}, role=${args.role})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

/**
 * Creates every composite index declared in firestore.indexes.json.
 *
 * The Firebase CLI is the usual way to do this (`firebase deploy --only
 * firestore:indexes`), but it needs an interactive OAuth login. This script
 * uses the service-account credentials already in .env instead, so index
 * deploys work anywhere the backend itself runs — including CI.
 *
 * It only ever CREATES indexes. Unlike the CLI it never deletes indexes
 * that are missing from the file, so running it can't take away an index
 * something else depends on.
 *
 * Requires the service account to hold "Cloud Datastore Index Admin"
 * (roles/datastore.indexAdmin). The default firebase-adminsdk account can
 * read and write documents but NOT manage indexes, so without that grant
 * every request here comes back "The caller does not have permission" —
 * add the role in IAM, or fall back to the Firebase CLI.
 *
 * Usage:
 *   npm run deploy-indexes
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GoogleAuth } from "google-auth-library";
import { clientEmail, privateKey, projectId } from "./firebaseAdmin";

interface IndexField {
  fieldPath: string;
  order?: "ASCENDING" | "DESCENDING";
  arrayConfig?: "CONTAINS";
}

interface IndexSpec {
  collectionGroup: string;
  queryScope: string;
  fields: IndexField[];
}

const API_ROOT = "https://firestore.googleapis.com/v1";

function describe(spec: IndexSpec): string {
  const fields = spec.fields
    .map((f) => `${f.fieldPath} ${f.arrayConfig ?? f.order ?? ""}`.trim())
    .join(", ");
  return `${spec.collectionGroup}(${fields})`;
}

async function main() {
  const file = join(__dirname, "..", "firestore.indexes.json");
  const { indexes } = JSON.parse(readFileSync(file, "utf8")) as { indexes: IndexSpec[] };

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    projectId,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  const client = await auth.getClient();

  const base = `${API_ROOT}/projects/${projectId}/databases/(default)/collectionGroups`;

  let created = 0;
  let existing = 0;
  const failed: string[] = [];

  for (const spec of indexes) {
    const label = describe(spec);
    try {
      await client.request({
        url: `${base}/${spec.collectionGroup}/indexes`,
        method: "POST",
        data: {
          queryScope: spec.queryScope,
          fields: spec.fields.map((f) =>
            f.arrayConfig
              ? { fieldPath: f.fieldPath, arrayConfig: f.arrayConfig }
              : { fieldPath: f.fieldPath, order: f.order },
          ),
        },
      });
      created += 1;
      console.log(`  created  ${label}`);
    } catch (err) {
      const status = (err as { status?: number }).status;
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message ?? (err as Error).message;

      // 409 ALREADY_EXISTS is the expected outcome for a re-run.
      if (status === 409 || /already exists/i.test(message)) {
        existing += 1;
        console.log(`  exists   ${label}`);
        continue;
      }
      failed.push(`${label}: ${message}`);
      console.error(`  FAILED   ${label} — ${message}`);
    }
  }

  console.log(
    `\n${created} created, ${existing} already present, ${failed.length} failed ` +
      `(of ${indexes.length} declared).`,
  );
  if (created > 0) {
    console.log(
      "New indexes build in the background; queries that need them keep failing " +
        "until the build finishes. Watch progress in the Firebase console.",
    );
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Failed to deploy indexes:", err);
  process.exit(1);
});

/**
 * A minimal in-memory Firestore double covering exactly the Admin SDK
 * surface this codebase uses: collection/doc get/set/update/delete,
 * where/orderBy/limit/offset queries, count() aggregation, batches, and
 * transactions. It exists so the service-layer tests exercise the real
 * business logic (src/services/*, src/middleware/*) against something
 * that behaves like Firestore, without needing a live project or the
 * Firestore emulator (Java + firebase-tools) in this environment.
 */

type DocData = Record<string, unknown>;

interface FakeTimestamp {
  __fakeTimestamp: true;
  toDate(): Date;
  toMillis(): number;
}

const SERVER_TIMESTAMP = Symbol("serverTimestamp");

function isFakeTimestamp(value: unknown): value is FakeTimestamp {
  return Boolean(value) && typeof value === "object" && (value as never)["__fakeTimestamp"] === true;
}

export function makeTimestamp(date: Date): FakeTimestamp {
  return {
    __fakeTimestamp: true,
    toDate: () => date,
    toMillis: () => date.getTime(),
  };
}

/** Recursively replaces FieldValue.serverTimestamp() sentinels with a resolved fake Timestamp. */
function resolveWrite(data: DocData): DocData {
  const out: DocData = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value === SERVER_TIMESTAMP ? makeTimestamp(new Date()) : value;
  }
  return out;
}

function comparableValue(value: unknown): unknown {
  return isFakeTimestamp(value) ? value.toMillis() : value;
}

function matchesFilter(doc: DocData, field: string, op: string, expected: unknown): boolean {
  const actual = comparableValue(doc[field]);
  const cmp = comparableValue(expected);
  switch (op) {
    case "==":
      return actual === cmp;
    case ">=":
      return (actual as never) >= (cmp as never);
    case "<=":
      return (actual as never) <= (cmp as never);
    case "<":
      return (actual as never) < (cmp as never);
    case ">":
      return (actual as never) > (cmp as never);
    case "in":
      return Array.isArray(expected) && expected.includes(doc[field]);
    default:
      throw new Error(`FakeFirestore: unsupported operator ${op}`);
  }
}

interface Filter {
  field: string;
  op: string;
  value: unknown;
}
interface Order {
  field: string;
  direction: "asc" | "desc";
}

export class FakeStore {
  collections = new Map<string, Map<string, DocData>>();
  private idCounter = 0;

  reset() {
    this.collections.clear();
    this.idCounter = 0;
  }

  private collectionMap(name: string): Map<string, DocData> {
    let map = this.collections.get(name);
    if (!map) {
      map = new Map();
      this.collections.set(name, map);
    }
    return map;
  }

  nextId(): string {
    this.idCounter += 1;
    return `fake-id-${this.idCounter}`;
  }

  getDoc(collectionName: string, id: string): DocData | undefined {
    return this.collectionMap(collectionName).get(id);
  }

  setDoc(collectionName: string, id: string, data: DocData) {
    this.collectionMap(collectionName).set(id, resolveWrite(data));
  }

  updateDoc(collectionName: string, id: string, data: DocData) {
    const existing = this.collectionMap(collectionName).get(id);
    if (!existing) throw new Error(`FakeFirestore: cannot update missing doc ${collectionName}/${id}`);
    this.collectionMap(collectionName).set(id, { ...existing, ...resolveWrite(data) });
  }

  deleteDoc(collectionName: string, id: string) {
    this.collectionMap(collectionName).delete(id);
  }

  queryDocs(collectionName: string, filters: Filter[], orders: Order[]): [string, DocData][] {
    let docs = [...this.collectionMap(collectionName).entries()];
    for (const f of filters) {
      docs = docs.filter(([, data]) => matchesFilter(data, f.field, f.op, f.value));
    }
    for (const o of orders) {
      docs.sort((a, b) => {
        const av = comparableValue(a[1][o.field]) as never;
        const bv = comparableValue(b[1][o.field]) as never;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return o.direction === "desc" ? -cmp : cmp;
      });
    }
    return docs;
  }
}

export const fakeStore = new FakeStore();

interface FakeDocSnapshot {
  id: string;
  exists: boolean;
  data: () => DocData | undefined;
}

interface FakeDocRef {
  id: string;
  get(): Promise<FakeDocSnapshot>;
  set(data: DocData, options?: { merge?: boolean }): Promise<void>;
  update(data: DocData): Promise<void>;
  delete(): Promise<void>;
}

function makeDocRef(collectionName: string, id: string): FakeDocRef {
  return {
    id,
    async get() {
      const data = fakeStore.getDoc(collectionName, id);
      return { id, exists: data !== undefined, data: () => data };
    },
    async set(data, options) {
      if (options?.merge) {
        const existing = fakeStore.getDoc(collectionName, id) ?? {};
        fakeStore.setDoc(collectionName, id, { ...existing, ...data });
      } else {
        fakeStore.setDoc(collectionName, id, data);
      }
    },
    async update(data) {
      fakeStore.updateDoc(collectionName, id, data);
    },
    async delete() {
      fakeStore.deleteDoc(collectionName, id);
    },
  };
}

class FakeQuery {
  constructor(
    private collectionName: string,
    private filters: Filter[] = [],
    private orders: Order[] = [],
    private limitN: number | null = null,
    private offsetN: number | null = null,
  ) {}

  where(field: string, op: string, value: unknown): FakeQuery {
    return new FakeQuery(
      this.collectionName,
      [...this.filters, { field, op, value }],
      this.orders,
      this.limitN,
      this.offsetN,
    );
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc"): FakeQuery {
    return new FakeQuery(
      this.collectionName,
      this.filters,
      [...this.orders, { field, direction }],
      this.limitN,
      this.offsetN,
    );
  }

  limit(n: number): FakeQuery {
    return new FakeQuery(this.collectionName, this.filters, this.orders, n, this.offsetN);
  }

  offset(n: number): FakeQuery {
    return new FakeQuery(this.collectionName, this.filters, this.orders, this.limitN, n);
  }

  private matched() {
    return fakeStore.queryDocs(this.collectionName, this.filters, this.orders);
  }

  async get() {
    let docs = this.matched();
    if (this.offsetN) docs = docs.slice(this.offsetN);
    if (this.limitN !== null) docs = docs.slice(0, this.limitN);
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs: docs.map(([id, data]) => ({ id, data: () => data })),
    };
  }

  count() {
    return {
      get: async () => ({ data: () => ({ count: this.matched().length }) }),
    };
  }
}

interface FakeWriteOp {
  type: "set" | "update" | "delete";
  collectionName: string;
  id: string;
  data?: DocData;
}

class FakeWriter {
  protected ops: FakeWriteOp[] = [];

  set(ref: FakeDocRef, data: DocData) {
    const { collectionName, id } = refParts(ref);
    this.ops.push({ type: "set", collectionName, id, data });
    return this;
  }

  update(ref: FakeDocRef, data: DocData) {
    const { collectionName, id } = refParts(ref);
    this.ops.push({ type: "update", collectionName, id, data });
    return this;
  }

  delete(ref: FakeDocRef) {
    const { collectionName, id } = refParts(ref);
    this.ops.push({ type: "delete", collectionName, id });
    return this;
  }

  apply() {
    for (const op of this.ops) {
      if (op.type === "set") fakeStore.setDoc(op.collectionName, op.id, op.data!);
      else if (op.type === "update") fakeStore.updateDoc(op.collectionName, op.id, op.data!);
      else fakeStore.deleteDoc(op.collectionName, op.id);
    }
  }
}

class FakeWriteBatch extends FakeWriter {
  async commit() {
    this.apply();
  }
}

class FakeTransaction extends FakeWriter {
  async get(ref: FakeDocRef) {
    return ref.get();
  }
}

// DocumentReference objects need to carry their collection name/id for the
// writer classes above to route writes correctly without a real client.
const refRegistry = new WeakMap<object, { collectionName: string; id: string }>();
function refParts(ref: object) {
  const parts = refRegistry.get(ref);
  if (!parts) throw new Error("FakeFirestore: unknown document reference");
  return parts;
}

class FakeCollectionRef {
  constructor(private name: string) {}

  doc(id?: string): FakeDocRef {
    const docId = id ?? fakeStore.nextId();
    const ref = makeDocRef(this.name, docId);
    refRegistry.set(ref, { collectionName: this.name, id: docId });
    return ref;
  }

  where(field: string, op: string, value: unknown) {
    return new FakeQuery(this.name).where(field, op, value);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new FakeQuery(this.name).orderBy(field, direction);
  }

  limit(n: number) {
    return new FakeQuery(this.name).limit(n);
  }

  count() {
    return new FakeQuery(this.name).count();
  }

  async get() {
    return new FakeQuery(this.name).get();
  }
}

export class FakeFirestoreDb {
  collection(name: string) {
    return new FakeCollectionRef(name);
  }

  batch() {
    return new FakeWriteBatch();
  }

  async runTransaction<T>(fn: (tx: FakeTransaction) => Promise<T>): Promise<T> {
    const tx = new FakeTransaction();
    const result = await fn(tx);
    // Only apply writes if the callback completed without throwing —
    // mirrors Firestore's all-or-nothing transaction semantics.
    tx.apply();
    return result;
  }
}

export const fakeFirestoreModule = {
  getFirestore: () => new FakeFirestoreDb(),
  FieldValue: {
    serverTimestamp: () => SERVER_TIMESTAMP,
  },
  Timestamp: {
    fromDate: (date: Date) => makeTimestamp(date),
    now: () => makeTimestamp(new Date()),
  },
};

/**
 * A minimal in-memory Firebase Auth double. To keep tests simple, ID
 * "tokens" are just the user's uid — verifyIdToken(uid) looks the uid up
 * directly, so tests can call endpoints with `Authorization: Bearer <uid>`
 * once they've created a user via createUser/registerFakeUser.
 */

interface FakeUserRecord {
  uid: string;
  email: string;
  displayName?: string;
}

class FakeAuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class FakeAuth {
  private byUid = new Map<string, FakeUserRecord>();
  private byEmail = new Map<string, string>();
  private counter = 0;

  reset() {
    this.byUid.clear();
    this.byEmail.clear();
    this.counter = 0;
  }

  async createUser(input: { email: string; password: string; displayName?: string }) {
    if (this.byEmail.has(input.email)) {
      throw new FakeAuthError("auth/email-already-exists", "The email address is already in use");
    }
    this.counter += 1;
    const uid = `fake-uid-${this.counter}`;
    const record: FakeUserRecord = { uid, email: input.email, displayName: input.displayName };
    this.byUid.set(uid, record);
    this.byEmail.set(input.email, uid);
    return record;
  }

  async deleteUser(uid: string) {
    const record = this.byUid.get(uid);
    if (record) {
      this.byUid.delete(uid);
      this.byEmail.delete(record.email);
    }
  }

  async getUserByEmail(email: string) {
    const uid = this.byEmail.get(email);
    if (!uid) throw new FakeAuthError("auth/user-not-found", "No user found for the given email");
    return this.byUid.get(uid)!;
  }

  async verifyIdToken(token: string) {
    const record = this.byUid.get(token);
    if (!record) throw new FakeAuthError("auth/invalid-id-token", "Invalid token");
    return { uid: record.uid, email: record.email };
  }

  /** Test helper: register a user directly without going through createUser's email-uniqueness path. */
  registerFakeUser(uid: string, email: string) {
    this.byUid.set(uid, { uid, email });
    this.byEmail.set(email, uid);
  }
}

export const fakeAuth = new FakeAuth();

export const fakeAuthModule = {
  getAuth: () => fakeAuth,
};

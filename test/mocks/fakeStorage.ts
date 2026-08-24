/** Minimal in-memory Storage double — enough for config/firebase.ts to import without error, plus basic file save/signed-url behavior if a test needs it. */

class FakeFile {
  constructor(
    private bucket: FakeBucket,
    public path: string,
  ) {}

  async save(buffer: Buffer) {
    this.bucket.files.set(this.path, buffer);
  }

  async getSignedUrl() {
    return [`https://fake-storage.local/${this.bucket.name}/${this.path}?signed=1`];
  }
}

class FakeBucket {
  name = "fake-bucket";
  files = new Map<string, Buffer>();

  file(path: string) {
    return new FakeFile(this, path);
  }
}

const fakeBucket = new FakeBucket();

export const fakeStorageModule = {
  getStorage: () => ({ bucket: () => fakeBucket }),
};

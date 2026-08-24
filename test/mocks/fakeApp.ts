interface FakeApp {
  name: string;
  options: unknown;
}

const apps: FakeApp[] = [];

export function resetFakeApps() {
  apps.length = 0;
}

export const fakeAppModule = {
  cert: (options: unknown) => options,
  applicationDefault: () => ({}),
  getApps: () => apps,
  initializeApp: (options: unknown) => {
    const app: FakeApp = { name: "[DEFAULT]", options };
    apps.push(app);
    return app;
  },
};

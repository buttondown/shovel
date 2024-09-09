import { defineConfig } from 'playwright/test';

export default defineConfig({
    webServer: {
        command: 'just server-playwright',
        url: 'http://127.0.0.1:3045',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
    },
    testMatch: '*.e2e-test.ts',
    fullyParallel: true,
});

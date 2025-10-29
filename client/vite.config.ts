import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Prefer explicit env URLs if provided, otherwise fall back to docker service names
    // Example overrides:
    //   VITE_API_PROXY=http://localhost:3000
    //   VITE_FILES_PROXY=http://localhost:8081
    const apiTarget = env.VITE_API_PROXY || 'http://api-dev:3000';
    const filesTarget = env.VITE_FILES_PROXY || env.VITE_API_PROXY || 'http://api-dev:3000';

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {target: apiTarget, changeOrigin: true},
                '/files': {target: filesTarget, changeOrigin: true},
            },
            host: true,
            port: 5173,
        },
    };
});

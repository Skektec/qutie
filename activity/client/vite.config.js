import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	envDir: '../',
	server: {
		proxy: {
			'/api': {
				target: 'http://fluxus.ddns.net:3001',
				changeOrigin: true,
				secure: false,
				ws: true
			}
		},
		hmr: {
			clientPort: 443
		},
		host: '0.0.0.0',
		allowedHosts: ['localhost', 'fluxus.ddns.net']
	}
});

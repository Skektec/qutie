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
		host: '0.0.0.0',
		allowedHosts: [
			'localhost',
			'fluxus.ddns.net',
			'https://vernon-not-unto-aging.trycloudflare.com/'
		]
	}
});

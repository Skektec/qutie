import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
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
		allowedHosts: ['localhost', 'fluxus.ddns.net']
	}
});

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = document.querySelector('title')?.innerText || 'Laravel';

createInertiaApp({
	title: (title) => `${title} - ${appName}`,
	resolve: (name) => {
		const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');

		return resolvePageComponent(`./Pages/${name}.tsx`, pages).catch(() =>
			resolvePageComponent(`./Pages/${name}.jsx`, pages)
		);
	},
	setup({ el, App, props }) {
		createRoot(el).render(<App {...props} />);
	},
	progress: {
		color: '#4b5563',
	},
});

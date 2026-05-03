import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { route } from "ziggy-js";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-ignore
window.Pusher = Pusher;

// Reverb/Echo Configuration
const reverbHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const reverbPort = import.meta.env.VITE_REVERB_PORT || 8080;

// @ts-ignore
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: false, // Force unencrypted ws:// for local development
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

const appName = document.querySelector("title")?.innerText || "Laravel";

// @ts-ignore
window.route = route;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.{jsx,tsx}");

        return resolvePageComponent(`./Pages/${name}.tsx`, pages).catch(() =>
            resolvePageComponent(`./Pages/${name}.jsx`, pages),
        ) as Promise<any>;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: "#4b5563",
    },
});

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                        Pava Coffee
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                        Brewing calm, delivered fast.
                    </h1>
                    <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                        This page is served by Laravel, rendered with Inertia, and
                        powered by React. Start building your interface here.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
                    >
                        Explore menu
                    </button>
                    <button
                        type="button"
                        className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                        Meet the roasters
                    </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            label: 'Single-origin beans',
                            value: '12 rotating picks',
                        },
                        {
                            label: 'Subscriptions',
                            value: 'Weekly or monthly',
                        },
                        {
                            label: 'Brew guides',
                            value: 'Fresh every Friday',
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {item.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

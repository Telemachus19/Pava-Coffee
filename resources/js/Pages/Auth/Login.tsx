import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-secondary-background">
                <Link href="/" className="mb-8 group">
                    <div className="bg-main border-2 border-border p-3 rounded-base shadow-shadow group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none transition-all">
                        <span className="font-heading text-2xl tracking-tighter text-main-foreground">PAVA COFFEE</span>
                    </div>
                </Link>

                <Card className="w-full sm:max-w-md bg-secondary-background border-2 border-border rounded-base shadow-shadow">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-heading uppercase italic">Welcome back</CardTitle>
                        <CardDescription className="text-foreground/80 font-base">
                            Enter your credentials to access your account.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-heading text-lg">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.email && "bg-red-50"
                                    )}
                                    autoComplete="username"
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 font-heading">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="font-heading text-lg">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm underline font-heading hover:text-main transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.password && "bg-red-50"
                                    )}
                                    autoComplete="current-password"
                                    onChange={(e) => setData("password", e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600 font-heading">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="w-6 h-6 rounded-base border-2 border-border text-main focus:ring-0 cursor-pointer accent-black"
                                />
                                <Label htmlFor="remember" className="font-heading cursor-pointer select-none">
                                    Keep me logged in
                                </Label>
                            </div>

                            <Button
                                className="w-full h-12 bg-main text-main-foreground border-2 border-border rounded-base shadow-shadow font-heading text-xl uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                disabled={processing}
                            >
                                {processing ? "Authenticating..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t-2 border-border pt-6 mt-4 bg-main/5">
                        <p className="text-sm text-foreground/80 font-base">
                            Don't have an account?{" "}
                            <Link href="/register" className="underline font-heading text-foreground hover:text-main">
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

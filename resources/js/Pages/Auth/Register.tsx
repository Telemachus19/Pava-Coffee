import { Head, Link, useForm } from "@inertiajs/react";
import React from "react";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { cn } from "@/lib/utils";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        post("/register", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-secondary-background">
                <Link href="/" className="mb-8 group">
                    <div className="bg-main border-2 border-border p-3 rounded-base shadow-shadow group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none transition-all">
                        <span className="font-heading text-2xl tracking-tighter text-main-foreground">
                            PAVA COFFEE
                        </span>
                    </div>
                </Link>

                <Card className="w-full sm:max-w-md bg-secondary-background border-2 border-border rounded-base shadow-shadow">
                    <Card.Header className="space-y-1">
                        <Card.Title className="text-3xl font-heading uppercase italic">
                            Create Account
                        </Card.Title>
                        <Card.Description className="text-foreground/80 font-base">
                            Enter your details to register for a new account.
                        </Card.Description>
                    </Card.Header>

                    <Card.Content>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="font-heading text-lg"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.name && "bg-red-50",
                                    )}
                                    autoComplete="name"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="font-heading text-lg"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.email && "bg-red-50",
                                    )}
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="font-heading text-lg"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.password && "bg-red-50",
                                    )}
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="font-heading text-lg"
                                >
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className={cn(
                                        "rounded-base border-2 border-border focus-visible:ring-0 focus-visible:bg-main/10 bg-white h-12 text-black font-base",
                                        errors.password_confirmation && "bg-red-50",
                                    )}
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password_confirmation", e.target.value)
                                    }
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <Button
                                className="w-full h-12 bg-main text-main-foreground border-2 border-border rounded-base shadow-shadow font-heading text-xl uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                disabled={processing}
                            >
                                {processing ? "Creating Account..." : "Register"}
                            </Button>
                        </form>
                    </Card.Content>

                    <div className="flex flex-col items-center justify-center space-y-2 border-t-2 border-border pt-6 mt-4 pb-4 bg-main/5">
                        <p className="text-sm text-foreground/80 font-base">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="underline font-heading text-foreground hover:text-main"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </>
    );
}
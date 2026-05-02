import { Head, Link, useForm, usePage } from "@inertiajs/react";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { cn } from "@/lib/utils";

type ResetPasswordProps = {
    token: string;
    email?: string;
};

export default function ResetPassword() {
    const { token, email } = usePage<ResetPasswordProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email: email ?? "",
        password: "",
        password_confirmation: "",
    });

    const submit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        post("/reset-password", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Reset password" />

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
                            Create a new password
                        </Card.Title>
                        <Card.Description className="text-foreground/80 font-base">
                            Choose a strong password to secure your account.
                        </Card.Description>
                    </Card.Header>

                    <Card.Content>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    className="font-heading text-lg"
                                    htmlFor="email"
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
                                    onChange={(event) =>
                                        setData("email", event.target.value)
                                    }
                                    autoComplete="email"
                                />
                                {errors.email ? (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.email}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    className="font-heading text-lg"
                                    htmlFor="password"
                                >
                                    New password
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
                                    onChange={(event) =>
                                        setData("password", event.target.value)
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password ? (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.password}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    className="font-heading text-lg"
                                    htmlFor="password_confirmation"
                                >
                                    Confirm password
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
                                    onChange={(event) =>
                                        setData(
                                            "password_confirmation",
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password_confirmation ? (
                                    <p className="text-sm text-red-600 font-heading">
                                        {errors.password_confirmation}
                                    </p>
                                ) : null}
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-main text-main-foreground border-2 border-border rounded-base shadow-shadow font-heading text-xl uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                disabled={processing}
                            >
                                {processing ? "Updating..." : "Reset password"}
                            </Button>
                        </form>
                    </Card.Content>

                    <div className="flex flex-col items-center justify-center space-y-2 border-t-2 border-border pt-6 mt-4 pb-4 bg-main/5">
                        <Link
                            href="/login"
                            className="underline font-heading text-foreground hover:text-main text-sm"
                        >
                            Back to login
                        </Link>
                        <span className="text-xs text-foreground/60 font-base">
                            Tokens expire after 60 minutes.
                        </span>
                    </div>
                </Card>
            </div>
        </>
    );
}

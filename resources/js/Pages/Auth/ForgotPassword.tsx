import { Head, Link, useForm, usePage } from "@inertiajs/react";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { cn } from "@/lib/utils";

type ForgotPasswordProps = {
    status?: string;
};

export default function ForgotPassword() {
    const { status } = usePage().props as ForgotPasswordProps;
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        post("/forgot-password");
    };

    return (
        <>
            <Head title="Forgot password" />
            
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
                            Reset access
                        </Card.Title>
                        <Card.Description className="text-foreground/80 font-base">
                            We will email you a secure reset link.
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
                            {status ? (
                                <div className="rounded-base border-2 border-border bg-main px-3 py-2 text-sm text-main-foreground shadow-shadow font-heading">
                                    {status}
                                </div>
                            ) : null}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-main text-main-foreground border-2 border-border rounded-base shadow-shadow font-heading text-xl uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                disabled={processing}
                            >
                                {processing ? "Sending..." : "Email reset link"}
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
                            Need help? Contact support.
                        </span>
                    </div>
                </Card>
            </div>
        </>
    );
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSignUp } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const signupSchema = z.object({
    firstName: z.string({ error: "Please enter a first name." }),
    lastName: z.string({ error: "Please enter a last name." }),
    email: z.email({ error: "Please enter a valid email address" }),
});

type SignUpData = z.infer<typeof signupSchema>;

export default function Signup() {
    const { isLoaded, signUp } = useSignUp();
    const router = useRouter();

    const signUpForm = useForm<SignUpData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {

        },
    });

    async function onSubmit(data: SignUpData) {
        if (!isLoaded && !signUp) return null;

        const { email, firstName, lastName } = data;

        try {
            await signUp.create({
                emailAddress: email,
                firstName,
                lastName,
            })

            await signUp.prepareEmailAddressVerification();
            toast.success("Success, verification email sent to " + email, {
                description: "Redirecting"
            });
            router.push(`/verify-email?isSignUp=true`);

        } catch (error: any) {
            console.error("Error", JSON.stringify(error, null, 2));
            if (error.errors[0].longMessage.includes("email address is taken")) {
                toast.error("Error", {
                    description: "Email address already taken. Please sign into your account.   Redirecting."
                });
                router.push("/sign-in");
                return;
            }
            toast.error("Error", {
                description: error.errors[0].longMessage
            });
        };
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/50 shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="text-4xl font-bold tracking-tight">
                            Triple I
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
                    <CardDescription className="text-muted-foreground">Enter your information to get started</CardDescription>
                </CardHeader>
                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSubmit)} className="space-y-4">
                        <CardContent className="space-y-4">
                            <FormField
                                control={signUpForm.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel htmlFor="name" className="text-sm font-medium">
                                            First Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="fName"
                                                type="text"
                                                placeholder="John"
                                                className="h-11"
                                                disabled={signUpForm.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel htmlFor="name" className="text-sm font-medium">
                                            Last Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="lName"
                                                type="text"
                                                placeholder="Doe"
                                                className="h-11"
                                                disabled={signUpForm.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="jdoe@example.com"
                                                className="h-11"
                                                disabled={signUpForm.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                className="w-full h-11 font-medium"
                                disabled={signUpForm.formState.isSubmitting}
                            >
                                {signUpForm.formState.isSubmitting ?
                                    <>
                                        <Loader className="mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                    : "Sign up"
                                }
                            </Button>
                            <div id="clerk-captcha" />
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/" className="text-foreground hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

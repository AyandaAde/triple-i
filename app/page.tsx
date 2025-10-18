"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth, useSignIn } from "@clerk/nextjs"
import {
  EmailCodeFactor,
  SignInFirstFactor,
} from "@clerk/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const signInSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
});

type SignInData = z.infer<typeof signInSchema>;

export default function Home() {
  const {isSignedIn} = useAuth();
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: SignInData) {
    if (!isLoaded && !signIn) return null;

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: values.email,
      });

      const isEmailCodeFactor = (
        factor: SignInFirstFactor
      ): factor is EmailCodeFactor => {
        return factor.strategy === "email_code";
      };

      const emailCodeFactor = supportedFirstFactors?.find(isEmailCodeFactor);

      if (emailCodeFactor) {
        const { emailAddressId } = emailCodeFactor;

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId,
        });
      }
      router.push(`/verify-email?isSignedIn=true`);

    } catch (error) {
      console.log("Error", JSON.stringify(error, null, 2));
      if ((error as any).errors[0].code === "form_identifier_not_found") {
        toast.error(
          "User not found. Please create an account."
        );
        router.push("/sign-up");
      }
    }
  };

  useEffect(()=>{
    if(isSignedIn) router.push("/dashboard");
  },[isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl font-bold tracking-tight">
              Triple I
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <FormField
                control={signInForm.control}
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
                        disabled={signInForm.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11 font-medium" disabled={signInForm.formState.isSubmitting}>
                {signInForm.formState.isSubmitting ?
                  <>
                    <Loader className="mr-2 animate-spin" />
                    Signing in...
                  </>
                  : "Sign in"
                }
              </Button>
              <div id="clerk-captcha" />
              <p className="text-sm text-center text-muted-foreground">
                {"Don't have an account? "}
                <Button
                  type="button"
                  variant="link"
                  className="text-foreground hover:underline font-medium m-0 p-0"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign up
                </Button>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

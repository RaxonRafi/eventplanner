"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRegisterMutation } from "@/redux/features/User/user.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, {
        error: "Name is too short",
      })
      .max(50, { message: "Name is too long" }),
    email: z.email(),
    role: z
      .enum([Role.USER, Role.ORGANIZER])
      .refine((val) => val === Role.USER || val === Role.ORGANIZER, {
        message: "Role must be user or organizer",
      }),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
      }),
    cpassword: z.string({ message: "Confirm your password" }),
  })
  .refine((data) => data.password === data.cpassword, {
    message: "Password do not match",
    path: ["cpassword"],
  });

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      role: Role.USER,
      password: "",
      cpassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const userInfo = {
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    };
    try {
      const result = await register(userInfo).unwrap();
      console.log(result);
      toast.success("Registered Successfully!");
      router.push("/login");
    } catch (error) {
      console.log(error);
      toast.error("Registration Failed!");
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("p-6 md:p-8", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground text-balance">
              Register to your UrBoxMate account
            </p>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name....." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Email....." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value={Role.USER} />
                      </FormControl>
                      <FormLabel className="font-normal">User</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value={Role.ORGANIZER} />
                      </FormControl>
                      <FormLabel className="font-normal">Organizer</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpassword"
            rules={{
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            Submit
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              login
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

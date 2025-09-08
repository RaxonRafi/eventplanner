import loginImg from "../../../../public/images/login.jpg"
import Image from "next/image"
import { RegisterForm } from "@/components/forms/registerForm"

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm/>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={loginImg}
          alt="Login"
          fill
          priority
          className="object-cover w-full h-full dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import { z } from "zod";
import inlineLogoSvg from "@/assets/svg/inline.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/http/generated/auth/auth";

const signInForm = z.object({
  document: z.string(),
  password: z.string(),
});

type SignInForm = z.infer<typeof signInForm>;

export default function SignIn() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof signInForm>>({
    resolver: standardSchemaResolver(signInForm),
    defaultValues: {
      password: "",
      document: "",
    },
  });

  const registerWithMask = useHookFormMask(form.register);

  const { mutateAsync: signInAsync } = useSignIn();

  async function onSubmit(data: SignInForm) {
    await signInAsync({ data });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <img alt="Logo" className="h-5" src={inlineLogoSvg} />

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Acessar plataforma</CardTitle>
              <CardDescription>
                Preencha os campos para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                autoComplete="off"
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="document">Email</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <UserIcon />
                    </InputGroupAddon>

                    <InputGroupInput
                      autoComplete="off"
                      id="document"
                      placeholder="Digite seu CPF"
                      {...registerWithMask("document", "cpf", {
                        showMaskOnFocus: false,
                        showMaskOnHover: false,
                        autoUnmask: true,
                      })}
                    />
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon />
                    </InputGroupAddon>

                    <InputGroupInput
                      autoComplete="new-password"
                      id="password"
                      placeholder="Digite sua senha"
                      type={isPasswordVisible ? "text" : "password"}
                      {...form.register("password")}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <Button type="submit">Login</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

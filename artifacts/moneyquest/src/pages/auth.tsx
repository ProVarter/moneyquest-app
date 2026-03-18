import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
});

export default function AuthPage() {
  const [isPending, setIsPending] = useState(false);
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setIsPending(true);
    try {
      await login(values);
      setLocation("/");
    } catch (err) {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setIsPending(true);
    try {
      await register(values);
      setLocation("/onboarding");
    } catch (err) {
      toast({ title: "Registration failed", description: "Email might be in use", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <PageTransition className="flex items-center justify-center min-h-screen px-4 py-12 pb-12 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
      </div>

      <Card className="w-full z-10 glass-panel border-0 shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-accent relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMtMjAgMjB6TTQwIDBMMCA0MGgyMGw0MC00MHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-20" />
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-lg border border-white/30 z-10 text-white">
            <Coins className="w-10 h-10" />
          </div>
        </div>
        
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-display font-bold">MoneyQuest</CardTitle>
          <CardDescription className="text-base">Level up your financial life</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-secondary/50 mb-6 p-1">
              <TabsTrigger value="login" className="rounded-lg text-sm font-semibold">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg text-sm font-semibold">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-background" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-background" type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold bg-primary hover:bg-primary/90 mt-2" disabled={isPending}>
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Quest"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Name</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-background" placeholder="Hero Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-background" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-xl bg-background" type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 mt-2" disabled={isPending}>
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Character"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageTransition>
  );
}

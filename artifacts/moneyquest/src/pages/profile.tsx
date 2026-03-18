import { useAuth } from "@/hooks/use-auth";
import { useGetUserSettings, useUpdateUserSettings } from "@workspace/api-client-react";
import { useAppStore } from "@/lib/store";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Settings, Crown, Moon, Globe, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: settings } = useGetUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { theme, setTheme, language, setLanguage } = useAppStore();
  const { toast } = useToast();

  const handleThemeChange = (val: string) => {
    const newTheme = val as 'light' | 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    if (settings) {
      updateSettings.mutate({ data: { theme: newTheme } });
    }
  };

  const handleLangChange = (val: string) => {
    setLanguage(val);
    if (settings) {
      updateSettings.mutate({ data: { language: val } });
    }
    toast({ title: "Language Updated" });
  };

  if (!user) return null;

  return (
    <PageTransition className="pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Hero Profile</h1>
      </div>

      <StaggerContainer className="space-y-6">
        {/* Profile Header Card */}
        <StaggerItem>
          <Card className="rounded-[2rem] border-0 bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white shadow-xl shadow-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-display font-black border border-white/30 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-white/80 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/10 text-center backdrop-blur-md">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Level</div>
                  <div className="text-2xl font-black">{user.level}</div>
                </div>
                <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/10 text-center backdrop-blur-md">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total XP</div>
                  <div className="text-2xl font-black">{user.xp}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Premium Banner */}
        <StaggerItem>
          {!user.isPremium ? (
            <div className="gamified-card bg-gradient-to-r from-accent/20 to-accent/5 border-accent/30 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 shrink-0">
                <img src={`${import.meta.env.BASE_URL}images/premium-badge.png`} alt="Premium" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Unlock Premium</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Get unlimited goals, custom categories, and deep analytics.</p>
              </div>
              <Button size="sm" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">Upgrade</Button>
            </div>
          ) : null}
        </StaggerItem>

        {/* Settings List */}
        <StaggerItem>
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Preferences
            </h3>
            <Card className="rounded-2xl border-border overflow-hidden">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg"><Moon className="w-4 h-4" /></div>
                    <span className="font-medium text-sm">Dark Mode</span>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')} 
                  />
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg"><Globe className="w-4 h-4" /></div>
                    <span className="font-medium text-sm">Language</span>
                  </div>
                  <Select value={language} onValueChange={handleLangChange}>
                    <SelectTrigger className="w-[120px] h-9 rounded-lg bg-secondary/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg"><DollarSign className="w-4 h-4" /></div>
                    <span className="font-medium text-sm">Currency</span>
                  </div>
                  <Select 
                    value={settings?.currency || "USD"} 
                    onValueChange={(v) => updateSettings.mutate({ data: { currency: v } })}
                  >
                    <SelectTrigger className="w-[120px] h-9 rounded-lg bg-secondary/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive font-bold text-base mt-4"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-2" /> End Session (Sign Out)
          </Button>
        </StaggerItem>

      </StaggerContainer>
      <div className="h-24" />
    </PageTransition>
  );
}

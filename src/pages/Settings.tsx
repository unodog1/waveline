import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelayListManager } from '@/components/RelayListManager';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function Settings() {
  const { user } = useCurrentUser();
  const { theme, setTheme } = useTheme();

  useSeoMeta({
    title: 'Settings - Waveline',
    description: 'Configure your Waveline experience',
  });

  if (!user) {
    return (
      <Layout showSearch={false} showRightSidebar={false}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to access settings</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false} showRightSidebar={false}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl">
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="relays" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Relays
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <EditProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relays" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Relay Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <RelayListManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

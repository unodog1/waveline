import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Layout } from '@/components/Layout';
import { DMMessagingInterface } from '@/components/dm/DMMessagingInterface';
import { Card, CardContent } from '@/components/ui/card';

export default function Messages() {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Messages - Waveline',
    description: 'Your private messages',
  });

  if (!user) {
    return (
      <Layout showSearch={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <Card className="border-primary/10 bg-card/50 max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view messages</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false}>
      <div className="h-[calc(100vh-60px)] lg:h-[calc(100vh-72px)] pb-16 lg:pb-0">
        <DMMessagingInterface className="h-full" />
      </div>
    </Layout>
  );
}

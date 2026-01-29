import { useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

interface NostrBuildResponse {
  status: string;
  message: string;
  data: Array<{
    url: string;
    blurhash?: string;
    sha256?: string;
    type?: string;
    mime?: string;
    size?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  }>;
}

export function useNostrBuildUpload() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      const formData = new FormData();
      formData.append('fileToUpload', file);
      formData.append('submit', 'Upload Image');

      const response = await fetch('https://nostr.build/api/v2/upload/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: NostrBuildResponse = await response.json();

      if (data.status !== 'success' || !data.data?.[0]?.url) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        url: data.data[0].url,
        blurhash: data.data[0].blurhash,
        sha256: data.data[0].sha256,
        type: data.data[0].type,
        mime: data.data[0].mime,
        size: data.data[0].size,
        dimensions: data.data[0].dimensions,
      };
    },
  });
}

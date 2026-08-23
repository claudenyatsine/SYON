import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Initialize the Liveblocks client
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_placeholder_key",
});

// Type definitions for Liveblocks collaborative editor
export type Presence = {
  cursor: { x: number; y: number } | null;
  name?: string;
  color?: string;
};

export type Storage = {
  // Shared storage state if needed
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar?: string;
    color?: string;
  };
};

export type RoomEvent = {
  // Custom event structures
};

// Export context hooks to use throughout the application
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useSelf,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

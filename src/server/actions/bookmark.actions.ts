"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BookmarkRepository } from "@/server/repositories/BookmarkRepository";
import { BookmarkService } from "@/server/services/BookmarkService";
import { revalidatePath } from "next/cache";

const bookmarkRepository = new BookmarkRepository();
const bookmarkService = new BookmarkService(bookmarkRepository);

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Authentication required to manage bookmarks");
  }
  return session.user;
}

export async function getUserBookmarksAction() {
  try {
    const user = await getSessionUser();
    const bookmarks = await bookmarkService.getUserBookmarks(user.id);
    return { success: true, data: bookmarks } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

export async function createBookmarkAction(rawInput: unknown) {
  try {
    const user = await getSessionUser();
    const bookmark = await bookmarkService.createBookmark(user.id, rawInput);
    revalidatePath("/dashboard");
    return { success: true, data: bookmark } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

export async function updateBookmarkAction(rawInput: unknown) {
  try {
    const user = await getSessionUser();
    const bookmark = await bookmarkService.updateBookmark(user.id, rawInput);
    revalidatePath("/dashboard");
    return { success: true, data: bookmark } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

export async function deleteBookmarkAction(bookmarkId: string) {
  try {
    const user = await getSessionUser();
    await bookmarkService.deleteBookmark(user.id, bookmarkId);
    revalidatePath("/dashboard");
    return { success: true, data: { id: bookmarkId, deleted: true } } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

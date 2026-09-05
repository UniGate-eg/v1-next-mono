"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserBookmarksAction,
  createBookmarkAction,
  updateBookmarkAction,
  deleteBookmarkAction,
} from "@/server/actions/bookmark.actions";
import type { AppStatus } from "@/schemas/bookmark.schema";
import { toast } from "sonner";
import posthog from "posthog-js";

export const BOOKMARKS_QUERY_KEY = ["bookmarks"];

export function useBookmarks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: async () => {
      const res = await getUserBookmarksAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { universityId: string; status?: AppStatus; notes?: string }) => {
      const res = await createBookmarkAction(input);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
      toast.success("University added to your admissions tracker!");
      posthog.capture("university_bookmarked", {
        university_id: variables.universityId,
        initial_status: variables.status ?? "INTERESTED",
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save bookmark.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { bookmarkId: string; status?: AppStatus; notes?: string }) => {
      const res = await updateBookmarkAction(input);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: BOOKMARKS_QUERY_KEY });
      const previous = queryClient.getQueryData(BOOKMARKS_QUERY_KEY);

      queryClient.setQueryData(BOOKMARKS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return old.map((item: any) =>
          item.id === updated.bookmarkId
            ? {
                ...item,
                ...(updated.status && { status: updated.status }),
                ...(updated.notes !== undefined && { notes: updated.notes }),
              }
            : item
        );
      });

      return { previous };
    },
    onSuccess: (data, variables) => {
      if (variables.notes !== undefined) {
        posthog.capture("application_note_saved", {
          bookmark_id: variables.bookmarkId,
          has_notes: Boolean(variables.notes),
        });
      }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(BOOKMARKS_QUERY_KEY, context.previous);
      }
      toast.error(err.message || "Failed to update application.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const res = await deleteBookmarkAction(bookmarkId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data, bookmarkId) => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
      toast.success("Removed from application tracker.");
      posthog.capture("university_bookmark_deleted", {
        bookmark_id: bookmarkId,
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete bookmark.");
    },
  });

  return {
    bookmarks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createBookmark: createMutation.mutate,
    updateBookmark: updateMutation.mutate,
    deleteBookmark: deleteMutation.mutate,
  };
}

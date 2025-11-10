import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { Friend } from "../../types/friend";
import type { ShareDrawerProps } from "../../types/shareDrawer";
import { getUserDisplayName } from "../../types/friend";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ShareDrawer({
  open,
  onOpenChange,
  quizId,
  quizVisibility: quizVisibilityProp,
}: ShareDrawerProps) {
  console.log("🚀 ShareDrawer rendered with props:", { open, quizId, quizVisibility: quizVisibilityProp });

  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // Fetch quiz data to get visibility only if not provided as prop
  const { data: quizData } = useQuery({
    queryKey: ["quizVisibility", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/custom/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
    enabled: open && !!quizId && !quizVisibilityProp,
  });

  const quizVisibility = quizVisibilityProp || quizData?.visibility || "PRIVATE";
  const isPrivate = quizVisibility === "PRIVATE";
  const isFriendsOrPublic = quizVisibility === "FRIENDS" || quizVisibility === "PUBLIC";

  // Fetch friends list
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    enabled: open,
  });

  // Fetch current shares for this quiz
  const { data: currentShares = [] } = useQuery({
    queryKey: ["quizShares", quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/sharing/quiz/${quizId}/shares`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      console.log("📊 Current shares data:", data);
      return data.data?.shares || [];
    },
    enabled: open && !!quizId,
  });

  // Initialize selected friends from current shares or all friends for FRIENDS/PUBLIC
  useEffect(() => {
    console.log("🔄 ShareDrawer useEffect triggered", {
      open,
      quizId,
      isFriendsOrPublic,
      isPrivate,
      currentSharesCount: currentShares.length,
      friendsCount: friends.length,
      quizVisibility,
    });

    if (open && quizId) {
      if (isFriendsOrPublic) {
        // For FRIENDS/PUBLIC visibility, all friends are selected (but disabled)
        const allFriendIds = new Set<string>(friends.map((f) => f.id));
        console.log("✅ Setting all friends as selected (FRIENDS/PUBLIC mode):", allFriendIds);
        setSelectedFriends(allFriendIds);
      } else {
        // For PRIVATE, only show explicitly shared friends
        const sharedUserIds = new Set<string>(
          currentShares.map((share: any) => share.sharedWith.id as string)
        );
        console.log("✅ Setting shared friends as selected (PRIVATE mode):", sharedUserIds);
        console.log("📋 Current shares:", currentShares);
        setSelectedFriends(sharedUserIds);
      }
    }
  }, [currentShares, open, quizId, friends, isFriendsOrPublic, isPrivate, quizVisibility]);

  // Share with friend mutation
  const shareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/learning/sharing/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
          friendUserId: friendId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to share quiz");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizShares", quizId] });
    },
  });

  // Unshare mutation
  const unshareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const share = currentShares.find(
        (s: any) => s.sharedWith.id === friendId
      );
      if (!share) return;

      const response = await fetch(
        `${BACKEND_URL}/learning/sharing/${share.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to unshare quiz");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizShares", quizId] });
    },
  });

  const handleToggleFriend = (friendId: string) => {
    if (!isPrivate) return; // Don't allow changes for FRIENDS/PUBLIC

    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
      unshareMutation.mutate(friendId);
    } else {
      newSelected.add(friendId);
      shareMutation.mutate(friendId);
    }
    setSelectedFriends(newSelected);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Share Lesson</DrawerTitle>
          <DrawerDescription>
            {isPrivate
              ? "Select friends who can access this lesson"
              : "To control who can access your quiz, please change your profile privacy settings"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="share-drawer-friends">
          {friends.length === 0 ? (
            <div className="share-drawer-no-friends">
              <p>No friends to share with yet.</p>
            </div>
          ) : (
            friends.map((friend) => (
              <label
                key={friend.id}
                className={`share-drawer-friend ${!isPrivate ? "share-drawer-friend-disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.has(friend.id)}
                  onChange={() => handleToggleFriend(friend.id)}
                  disabled={
                    !isPrivate ||
                    shareMutation.isPending ||
                    unshareMutation.isPending
                  }
                />
                <span className="share-drawer-friend-name">
                  {getUserDisplayName(friend)}
                </span>
              </label>
            ))
          )}
        </div>

        <DrawerFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
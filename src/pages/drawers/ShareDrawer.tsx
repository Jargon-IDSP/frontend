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
import { useProfile } from "../../hooks/useProfile";
import type { Friend } from "../../types/friend";
import type { ShareDrawerProps } from "../../types/shareDrawer";
import { getUserDisplayName } from "../../types/friend";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ShareDrawer({
  open,
  onOpenChange,
  quizId,
}: ShareDrawerProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );

  // Get user's default privacy setting
  const { data: profile } = useProfile();
  const defaultPrivacy = profile?.defaultPrivacy || "PRIVATE";
  const isPrivate = defaultPrivacy === "PRIVATE";
  const isFriends = defaultPrivacy === "FRIENDS";
  const isPublic = defaultPrivacy === "PUBLIC";
  const isFriendsOrPublic = isFriends || isPublic;

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
    staleTime: 5 * 60 * 1000,
  });

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
      const shares = data.data?.shares || [];
      // Ensure we always return an array, even if the API returns an object
      return Array.isArray(shares) ? shares : [];
    },
    enabled: open && !!quizId,
  });

  useEffect(() => {
    console.log("🔄 ShareDrawer useEffect:", {
      quizId,
      isFriendsOrPublic,
      friendsCount: friends.length,
      currentSharesCount: Array.isArray(currentShares)
        ? currentShares.length
        : 0,
      currentShares,
    });

    if (!quizId) return;

    // Ensure currentShares is always an array
    const sharesArray = Array.isArray(currentShares) ? currentShares : [];

    setSelectedFriends((prevSelected) => {
      let newSelectedIds: Set<string>;

      if (isFriendsOrPublic) {
        newSelectedIds = new Set<string>(friends.map((f) => f.id));
      } else {
        newSelectedIds = new Set<string>(
          sharesArray
            .map((share: any) => share.sharedWith?.id as string)
            .filter(Boolean)
        );
      }

      if (
        prevSelected.size === newSelectedIds.size &&
        Array.from(newSelectedIds).every((id) => prevSelected.has(id))
      ) {
        return prevSelected;
      }

      console.log("✅ Setting selected friends:", Array.from(newSelectedIds));
      return newSelectedIds;
    });
  }, [currentShares, quizId, friends, isFriendsOrPublic]);

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

  const unshareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const sharesArray = Array.isArray(currentShares) ? currentShares : [];
      const share = sharesArray.find((s: any) => s.sharedWith?.id === friendId);
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
    if (!isPrivate) return;

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
          <DrawerTitle>Share Your Lesson to:</DrawerTitle>
          <DrawerDescription>
            {isPrivate
              ? "Select friends who can access this lesson"
              : isFriends
              ? "All mutual friends can see all of your custom learnings. To limit visibility, adjust your privacy settings"
              : "All users can see all of your custom learnings. To limit visibility, adjust your privacy settings"}
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
                className={`share-drawer-friend ${
                  !isPrivate ? "share-drawer-friend-disabled" : ""
                }`}
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
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

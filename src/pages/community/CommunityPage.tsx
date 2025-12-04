import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { useProfile } from "../../hooks/useProfile";
import { getUserDisplayName, getLanguageCode } from "../../utils/userHelpers";
import { getLanguageFlag } from "../../utils/languageFlagHelpers";
import {
    getHeaderImage,
    getPreviewUsers,
    isCurrentUser as checkIsCurrentUser,
    type TabType,
} from "../../utils/communityHelpers";
import NotificationBell from "../../components/NotificationBell";
import LeaderboardItem from "../../components/LeaderboardItem";
import LoadingBar from "../../components/LoadingBar";
import LeaderboardConnectAvatar from "../../assets/leaderboardConnectAvatar.svg";
import findYourFriendsImg from "/findYourFriendsImg.svg";
import noFriendsImg from "/noFriendsImg.svg";
import rockyLogo from "/rocky.svg";
import communityPageLeaderShowImg from "/communityPageLeaderShowImg.svg";
import communityPageLeaderNoShowImg from "/communityPageLeaderNoShowImg.svg";
import { BACKEND_URL } from "../../lib/api";
import type { Friend, FriendsResponse } from "../../types/friend";
import friendsNoShowImg from "../../../public/FriendsNoShowImg.svg";
import { AvatarDisplay } from "../../components/avatar";

const CommunityPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getToken } = useAuth();
    const initialTab = (location.state as { tab?: TabType })?.tab || "leaderboard";
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [avatarLoadingCount, setAvatarLoadingCount] = useState(0);
    const avatarLoadingRef = useRef<Set<string>>(new Set());

    const { data: leaderboardUsers = [], isLoading: leaderboardLoading } =
        useLeaderboard("general");
    const { data: profile, isLoading: profileLoading } = useProfile();

    const { data: friends = [], isLoading: friendsLoading } = useQuery({
        queryKey: ["community", "friends"],
        queryFn: async (): Promise<Friend[]> => {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch friends");
            }

            const data: FriendsResponse = await res.json();
            return data.data || [];
        },
        staleTime: 30 * 1000,
        retry: 2,
    });

    const handleAvatarLoadingChange = (userId: string, isLoading: boolean) => {
        if (isLoading) {
            avatarLoadingRef.current.add(userId);
        } else {
            avatarLoadingRef.current.delete(userId);
        }
        setAvatarLoadingCount(avatarLoadingRef.current.size);
    };

    useEffect(() => {
        avatarLoadingRef.current.clear();
        setAvatarLoadingCount(0);
    }, [leaderboardUsers, friends]);

    const handleLeaderboardCardClick = () => {
        navigate("/leaderboard/full");
    };

    const handleFriendsCardClick = () => {
        navigate("/community/friends");
    };

    const userScore = profile?.score ?? 0;
    const hasNoPoints = !profileLoading && userScore === 0;

    const hasNoFriends = !friendsLoading && friends.length === 0;

    const previewUsers = getPreviewUsers(leaderboardUsers);

    const headerImage = getHeaderImage(activeTab, hasNoPoints, hasNoFriends, {
        leaderShowImg: communityPageLeaderShowImg,
        leaderNoShowImg: communityPageLeaderNoShowImg,
        friendsShowImg: findYourFriendsImg,
        friendsNoShowImg: noFriendsImg,
    });
    
   const isDataLoading = leaderboardLoading || profileLoading || friendsLoading;
    const areAvatarsLoading = avatarLoadingCount > 0;
    const showFullPageLoading = isDataLoading || areAvatarsLoading;
    const allDataLoaded = !isDataLoading && !areAvatarsLoading;

    return (
        <div className='container'>
            <LoadingBar
                isLoading={showFullPageLoading}
                hasData={allDataLoaded}
                text="Loading Community"
            />
            <main className='community-page'>
                <div className='community-header'>
                    <img
                        src={headerImage}
                        alt='Community'
                        className='community-title-image'
                    />
                </div>
                <div className='community-header-actions'>
                    <NotificationBell />
                </div>

                <div className='community-tabs'>
                    <button
                        type='button'
                        className={`community-tab ${
                            activeTab === "leaderboard"
                                ? "community-tab--active"
                                : ""
                        }`}
                        onClick={() => setActiveTab("leaderboard")}>
                        Leaderboard
                    </button>
                    <button
                        type='button'
                        className={`community-tab ${
                            activeTab === "friends"
                                ? "community-tab--active"
                                : ""
                        }`}
                        onClick={() => setActiveTab("friends")}>
                        Friends
                    </button>
                </div>

                <div className='community-content'>
                    {activeTab === "leaderboard" && (
                        <div
                            className='leaderboard-preview-card'
                            onClick={
                                !hasNoPoints
                                    ? handleLeaderboardCardClick
                                    : undefined
                            }>
                            {hasNoPoints ? (
                                <div className='leaderboard-preview-empty-state'>
                                    <img
                                        src={LeaderboardConnectAvatar}
                                        alt='Leaderboard Connect Avatar'
                                        className='leaderboard-preview-empty-avatar'
                                    />
                                    <p className='leaderboard-preview-empty-message'>
                                        You haven't started earning points yet.
                                        Go and start learning!
                                    </p>
                                    <button
                                        className='leaderboard-preview-start-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/learning");
                                        }}>
                                        Start Learning
                                    </button>
                                </div>
                            ) : previewUsers.length === 0 ? (
                                <div className='leaderboard-preview-empty'>
                                    <p>No users found</p>
                                </div>
                            ) : (
                                <>
                                    <div className='leaderboard-list'>
                                        {previewUsers.map((user, index) => {
                                            const actualRank = index + 4;
                                            const isCurrentUser =
                                                checkIsCurrentUser(
                                                    user.id,
                                                    profile?.id
                                                );
                                            return (
                                                <LeaderboardItem
                                                    key={user.id}
                                                    user={user}
                                                    rank={actualRank}
                                                    isCurrentUser={
                                                        isCurrentUser
                                                    }
                                                    isClickable={false}
                                                    onAvatarLoadingChange={(isLoading) =>
                                                        handleAvatarLoadingChange(user.id, isLoading)
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                    <p className='leaderboard-preview-view-more'>
                                        Click to see full leaderboard
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "friends" && (
                        <div
                            className='friends-preview-card'
                            onClick={
                                !hasNoFriends
                                    ? handleFriendsCardClick
                                    : undefined
                            }>
                            {hasNoFriends ? (
                                <div className='friends-preview-empty-state'>
                                    <img
                                        src={friendsNoShowImg}
                                        alt='No Friends'
                                        className='friends-preview-empty-image'
                                    />
                                    <p className='friends-preview-empty-message'>
                                        You don't have any friends yet. Click
                                        the button to add friends!
                                    </p>
                                    <button
                                        className='friends-preview-add-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/profile/friends");
                                        }}>
                                        Add Friends
                                    </button>
                                </div>
                            ) : friends.length === 0 ? (
                                <div className='friends-preview-empty'>
                                    <p>No friends found</p>
                                </div>
                            ) : (
                                <>
                                    <div className='friends-list'>
                                        {friends.map((friend) => {
                                            const isCurrentUser =
                                                checkIsCurrentUser(
                                                    friend.id,
                                                    profile?.id
                                                );
                                            const languageFlag =
                                                getLanguageFlag(
                                                    friend.language ?? null
                                                );
                                            return (
                                                <div
                                                    key={friend.id}
                                                    className={`friends-item ${
                                                        isCurrentUser
                                                            ? "friends-item--current-user"
                                                            : ""
                                                    }`}>
                                                    <div className='friends-item-content'>
                                                        {friend.avatar ? (
                                                            <AvatarDisplay
                                                                config={
                                                                    friend.avatar
                                                                }
                                                                size={48}
                                                                className='friends-item-avatar'
                                                                onLoadingChange={(isLoading) =>
                                                                    handleAvatarLoadingChange(friend.id, isLoading)
                                                                }
                                                            />
                                                        ) : (
                                                            <img
                                                                src={rockyLogo}
                                                                alt='Rocky'
                                                                className='friends-item-logo'
                                                            />
                                                        )}
                                                        <div className='friends-item-text'>
                                                            <span className='friends-item-name'>
                                                                {getUserDisplayName(
                                                                    friend
                                                                )}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className='friends-item-you'>
                                                                    (You)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='friends-item-details'>
                                                        {languageFlag && (
                                                            <img
                                                                src={
                                                                    languageFlag.src
                                                                }
                                                                alt={
                                                                    languageFlag.alt
                                                                }
                                                                className='friends-item-flag'
                                                            />
                                                        )}
                                                        <span className='friends-item-language'>
                                                            {getLanguageCode(
                                                                friend.language ??
                                                                    null
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className='friends-preview-actions'>
                                        <button
                                            className='friends-preview-action-button friends-preview-action-button--add'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate("/profile/friends");
                                            }}>
                                            Add Friends
                                        </button>
                                        <button
                                            className='friends-preview-action-button friends-preview-action-button--view'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate("/community/friends");
                                            }}>
                                            View Friends
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CommunityPage;

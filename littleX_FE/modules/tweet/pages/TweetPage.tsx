"use client";

import React from "react";

import LeftTweetSideBar from "@/ds/molecules/left-tweet-sidebar";
import RightTweetSidebar from "@/ds/molecules/right-tweet-sidebar";
import MainFeed from "@/ds/molecules/tweet-main";
import {
  MobileNavBar,
  MobileBottomNav,
  MobileRightSidebar,
} from "@/ds/molecules/mobile-components";

import ResponsiveDashboardTemplate from "@/ds/templates/responsive-dashboard-template";
import { useDashboard } from "@/_core/hooks/useDashboard";

const TweetPageContent = React.memo(({
  profile,
  userData,
  following,
  suggestions,
  isLoading,
  navMenu,
  currentTab,
  logout,
  handleSearch,
  handleFollow,
  handleUnfollow,
  feeds,
  searchResult,
  userTweets,
}: any) => {
  return (
    <>
      <ResponsiveDashboardTemplate
        // Mobile components
        mobileNavBar={
          <MobileNavBar userData={userData} onSearchSubmit={handleSearch} />
        }
        mobileBottomNav={<MobileBottomNav />}
        mobileRightSidebar={
          <MobileRightSidebar
            userData={userData}
            following={following}
            suggestions={suggestions}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        }
        // Desktop components
        leftSidebar={
          <LeftTweetSideBar
            logout={logout}
            userData={userData}
            navMenu={navMenu}
            currentRoute={`/?tab=${currentTab}`}
          />
        }
        main={
          <MainFeed
            feeds={feeds}
            userTweets={userTweets}
            searchResult={searchResult}
            profile={profile.user}
            isLoading={isLoading}
          />
        }
        rightSidebar={
          <RightTweetSidebar
            userData={userData}
            following={following}
            suggetions={suggestions}
          />
        }
        sidebarWidth="w-72"
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - return true if props are equal (skip re-render)
  return (
    prevProps.profile === nextProps.profile &&
    prevProps.userData === nextProps.userData &&
    prevProps.following === nextProps.following &&
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentTab === nextProps.currentTab
  );
});

const TweetPage = () => {
  const dashboardData = useDashboard();
  
  // Memoize to prevent re-renders of child components
  const memoizedData = React.useMemo(
    () => dashboardData,
    [
      dashboardData.profile,
      dashboardData.userData,
      dashboardData.following.length,
      dashboardData.suggestions.length,
      dashboardData.isLoading,
      dashboardData.navMenu,
      dashboardData.currentTab,
      dashboardData.feeds.length,
      dashboardData.searchResult.length,
      dashboardData.userTweets.length,
    ]
  );
  
  return <TweetPageContent {...memoizedData} />;
};

export default TweetPage;

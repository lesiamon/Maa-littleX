const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "index.html";
}

const BASE_URL = `${Constants.API_URL}/walker`;

const isProfilePage = window.location.pathname.includes("profile.html");

let currentUserProfile = null;

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
});

async function loadCurrentUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/get_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error("Failed to load profile");
    const data = await response.json();
    if (data.reports && data.reports.length > 0) {
      currentUserProfile = data.reports[0].user;
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.textContent =
          currentUserProfile.context.username || "Anonymous";
      }
      return currentUserProfile;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = "Anonymous";
    }
  }
}

async function loadProfilesToFollow() {
  try {
    const profileResponse = await fetch(`${BASE_URL}/get_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!profileResponse.ok) throw new Error("Failed to load profile");
    const profileData = await profileResponse.json();
    const currentFollowing =
      profileData.reports[0].user.context.followees || [];

    const response = await fetch(`${BASE_URL}/load_user_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Failed to load profiles");
    const data = await response.json();

    if (data.reports && data.reports.length > 0) {
      const profiles = data.reports[0];
      const followListElement = document.getElementById("followList");
      if (!followListElement) return;

      followListElement.innerHTML = "";

      // Filter out current user and already followed profiles
      const profilesToShow = profiles.filter((profile) => {
        return (
          !currentFollowing.includes(profile.id) &&
          profile.id !== profileData.reports[0].user.id
        );
      });

      if (profilesToShow.length === 0) {
        followListElement.innerHTML =
          '<div class="md-list-item">No new profiles to follow</div>';
        return;
      }

      profilesToShow.forEach((profile) => {
        const template = document.getElementById("profile-template");
        const profileElement = template.content.cloneNode(true);

        profileElement.querySelector(".profile-name").textContent =
          profile.name;

        const followBtn = profileElement.querySelector(".follow-btn");
        followBtn.addEventListener("click", async () => {
          await handleFollow(profile.id, followBtn);
        });

        followListElement.appendChild(profileElement);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    const followListElement = document.getElementById("followList");
    if (followListElement) {
      followListElement.innerHTML =
        '<div class="md-list-item">Error loading profiles</div>';
    }
  }
}

async function handleEdit(tweetId, content) {
  try {
    const response = await fetch(`${BASE_URL}/update_tweet/${tweetId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
      body: JSON.stringify({ updated_content: content }),
    });

    if (!response.ok) throw new Error("Failed to update tweet");
    await loadUserTweets();
    return true;
  } catch (error) {
    console.error("Error updating tweet:", error);
    return false;
  }
}

async function handleFollow(profileId, button) {
  try {
    const isFollowing = button.classList.contains("following");
    const baseEndpoint = isFollowing ? "/un_follow_request" : "/follow_request";
    const endpoint = `${baseEndpoint}/${profileId}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);
    }

    // Wait for the response to complete
    await response.text();

    // Immediately remove the profile card if in tweets page
    if (!isProfilePage) {
      const listItem = button.closest(".md-list-item");
      if (listItem) {
        listItem.remove();
        const followList = document.getElementById("followList");
        if (followList && followList.children.length === 0) {
          followList.innerHTML =
            '<div class="md-list-item">No new profiles to follow</div>';
        }
      }
    } else {
      // Handle profile page button state
      if (isFollowing) {
        button.textContent = "Follow";
        button.classList.remove("following");
      } else {
        button.textContent = "Following";
        button.classList.add("following");
      }
    }

    // Refresh data
    await loadCurrentUserProfile();

    // Refresh appropriate views
    if (isProfilePage) {
      await loadUserTweets();
      await loadFollowingUsers();
    } else {
      await loadTweets();
    }
  } catch (error) {
    console.error("Error following/unfollowing:", error);
  }
}

function renderComment(commentData) {
  const template = document.getElementById("comment-template");
  const commentElement = template.content.cloneNode(true);

  commentElement.querySelector(".username").textContent =
    commentData.username || "Anonymous";
  commentElement.querySelector(".content").textContent =
    commentData.content || "";

  return commentElement;
}

function renderTweet(tweetData) {
  if (!tweetData?.tweet?.content) return document.createElement("div");

  const tweet = tweetData.tweet;
  const template = document.getElementById("tweet-template");
  if (!template) return document.createElement("div");

  const tweetElement = template.content.cloneNode(true);
  const tweetId = tweet.content.id;

  // Basic elements
  const elements = {
    username: tweetElement.querySelector(".username"),
    content: tweetElement.querySelector(".content"),
    deleteBtn: tweetElement.querySelector(".delete-btn"),
    editBtn: tweetElement.querySelector(".edit-btn"),
    editForm: tweetElement.querySelector(".edit-form"),
    editInput: tweetElement.querySelector(".edit-input"),
    saveEditBtn: tweetElement.querySelector(".save-edit-btn"),
    cancelEditBtn: tweetElement.querySelector(".cancel-edit-btn"),
    likeBtn: tweetElement.querySelector(".like-btn"),
    commentsSection: tweetElement.querySelector(".comments-section"),
    commentsList: tweetElement.querySelector(".comments-list"),
    commentsCount: tweetElement.querySelector(".comments-count"),
    seeMoreBtn: tweetElement.querySelector(".see-more-comments"),
    commentForm: tweetElement.querySelector(".comment-form"),
  };

  // Set username and content
  if (elements.username) elements.username.textContent = tweet.username;
  if (elements.content) elements.content.textContent = tweet.content.content;

  // Handle delete button
  if (
    elements.deleteBtn &&
    isProfilePage &&
    tweet.username === currentUserProfile?.context?.username
  ) {
    elements.deleteBtn.style.display = "block";
    elements.deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this tweet?")) {
        await handleDelete(tweetId);
      }
    });
  }

  // Handle edit functionality
  if (
    tweet.username === currentUserProfile?.context?.username &&
    elements.editBtn
  ) {
    elements.editBtn.style.display = "block";
    setupEditFunctionality(elements, tweet, tweetId);
  }

  // Handle likes
  if (elements.likeBtn) {
    setupLikeFunctionality(elements.likeBtn, tweet, tweetId);
  }

  // Handle comments
  if (elements.commentsSection && elements.commentsList) {
    setupComments(elements, tweet.content.comments || [], tweetId);
  }

  return tweetElement;
}

function setupEditFunctionality(elements, tweet, tweetId) {
  const { editBtn, editForm, editInput, content, saveEditBtn, cancelEditBtn } =
    elements;
  if (!editBtn || !editForm || !editInput || !content) return;

  editBtn.addEventListener("click", () => {
    editForm.style.display = "block";
    content.style.display = "none";
    editInput.value = tweet.content.content;
  });

  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", async () => {
      const newContent = editInput.value.trim();
      if (!newContent) return;

      if (await handleEdit(tweetId, newContent)) {
        editForm.style.display = "none";
        content.style.display = "block";
        isProfilePage ? await loadUserTweets() : await loadTweets();
      }
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editForm.style.display = "none";
      content.style.display = "block";
    });
  }
}

function setupLikeFunctionality(likeBtn, tweet, tweetId) {
  const likeIcon = likeBtn.querySelector(".material-icons");
  const countSpan = likeBtn.querySelector(".count");
  if (!likeIcon || !countSpan) return;

  const likes = tweet.likes || [];
  const likeCount = likes.length;
  const isLiked = likes.some(
    (like) => like === currentUserProfile?.context?.username
  );

  likeBtn.addEventListener("click", async () => {
    if (!tweetId) return;
    await handleLike(tweetId);
    const newIsLiked = !isLiked;
    updateLikeUI(likeIcon, countSpan, newIsLiked, likeCount);
    isProfilePage ? await loadUserTweets() : await loadTweets();
  });

  updateLikeUI(likeIcon, countSpan, isLiked, likeCount);
}

function updateLikeUI(icon, count, isLiked, likeCount) {
  if (likeCount > 0) {
    count.textContent = likeCount;
    icon.textContent = isLiked ? "favorite" : "favorite_border";
    icon.style.color = isLiked ? "#f44336" : "";
  } else {
    count.textContent = "";
    icon.textContent = "favorite_border";
    icon.style.color = "";
  }
}

function setupComments(elements, comments, tweetId) {
  const { commentsList, seeMoreBtn, commentsCount, commentForm } = elements;
  commentsList.innerHTML = "";

  if (comments.length > 0) {
    // Function to render all or single comment
    const renderComments = (showAll = false) => {
      commentsList.innerHTML = "";
      const commentsToShow = showAll ? comments : [comments[0]];

      commentsToShow.forEach((comment) => {
        const commentEl = renderComment(comment);
        const commentContainer = commentEl.querySelector(".comment");
        const contentWrapper = commentEl.querySelector(".content-wrapper");
        const contentEl = commentEl.querySelector(".content");

        if (comment.username === currentUserProfile?.context?.username) {
          const actionDiv = document.createElement("div");
          actionDiv.className = "comment-actions";
          actionDiv.style.display = "flex";
          actionDiv.style.gap = "8px";
          actionDiv.style.marginLeft = "8px";

          // Edit button setup
          const editBtn = document.createElement("button");
          editBtn.className = "md-button md-button-text";
          editBtn.innerHTML = '<span class="material-icons">edit</span>';
          editBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEditButtonClick(
              comment,
              contentEl,
              actionDiv,
              commentContainer
            );
          };

          // Delete button
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "md-button md-button-text";
          deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
          deleteBtn.onclick = () => handleDeleteComment(comment.id, tweetId);

          actionDiv.appendChild(editBtn);
          actionDiv.appendChild(deleteBtn);
          contentWrapper.appendChild(actionDiv);
        }

        commentsList.appendChild(commentEl);
      });
    };

    // Initial render - show only first comment
    renderComments(false);

    // Setup toggle button visibility
    if (comments.length > 1) {
      // Show "See more" button
      seeMoreBtn.style.display = "block";
      seeMoreBtn.textContent = `See ${comments.length - 1} more comments`;

      let isExpanded = false;
      seeMoreBtn.onclick = () => {
        isExpanded = !isExpanded;
        renderComments(isExpanded);
        seeMoreBtn.textContent = isExpanded
          ? "Hide comments"
          : `See ${comments.length - 1} more comments`;
      };
    } else {
      seeMoreBtn.style.display = "none";
    }
  }

  // Update comments count
  if (commentsCount) {
    commentsCount.textContent = `${comments.length} comments`;
  }

  setupCommentForm(commentForm, tweetId);
}

async function handleEditComment(commentId, commentEl) {
  // Get the content element
  const contentElement = commentEl.querySelector(".content");
  if (!contentElement) return;

  // Create edit container
  const editContainer = document.createElement("div");
  editContainer.className = "edit-comment-container";
  editContainer.style.display = "flex";
  editContainer.style.gap = "8px";
  editContainer.style.marginTop = "8px";

  // Create input field
  const input = document.createElement("input");
  input.type = "text";
  input.className = "md-text-field-input";
  input.value = contentElement.textContent;
  input.style.flex = "1";

  // Create save button
  const saveButton = document.createElement("button");
  saveButton.className = "md-button md-button-contained";
  saveButton.textContent = "Save";

  // Create cancel button
  const cancelButton = document.createElement("button");
  cancelButton.className = "md-button md-button-outlined";
  cancelButton.textContent = "Cancel";

  // Add buttons to container
  editContainer.appendChild(input);
  editContainer.appendChild(saveButton);
  editContainer.appendChild(cancelButton);

  // Hide original content and show edit form
  contentElement.style.display = "none";
  contentElement.parentNode.appendChild(editContainer);

  // Handle save
  saveButton.addEventListener("click", async () => {
    const newContent = input.value.trim();
    if (!newContent) return;

    try {
      const response = await fetch(`${BASE_URL}/update_comment/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
        body: JSON.stringify({ updated_content: newContent }), // Changed from content to updated_content
      });

      if (!response.ok) throw new Error("Failed to update comment");

      contentElement.textContent = newContent;
      contentElement.style.display = "";
      editContainer.remove();

      // Refresh tweets
      isProfilePage ? await loadUserTweets() : await loadTweets();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  });

  // Handle cancel
  cancelButton.addEventListener("click", () => {
    contentElement.style.display = "";
    editContainer.remove();
  });

  // Focus input
  input.focus();
}
// Function to handle deleting a comment
async function handleDeleteComment(commentId, tweetId) {
  if (!confirm("Are you sure you want to delete this comment?")) return;

  try {
    const response = await fetch(`${BASE_URL}/remove_comment/${commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete comment");

    // Refresh tweets to show updated comments
    isProfilePage ? await loadUserTweets() : await loadTweets();
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

// Modified like button setup
function setupLikeFunctionality(likeBtn, tweet, tweetId) {
  const likeIcon = likeBtn.querySelector(".material-icons");
  const countSpan = likeBtn.querySelector(".count");
  if (!likeIcon || !countSpan) return;

  const likes = tweet.likes || [];
  const likeCount = likes.length;
  const isLiked = likes.some(
    (like) => like === currentUserProfile?.context?.username
  );

  likeBtn.addEventListener("click", async () => {
    if (!tweetId) return;

    if (isLiked) {
      await handleRemoveLike(tweetId);
    } else {
      await handleLike(tweetId);
    }

    const newIsLiked = !isLiked;
    updateLikeUI(likeIcon, countSpan, newIsLiked, likeCount);
    isProfilePage ? await loadUserTweets() : await loadTweets();
  });

  updateLikeUI(likeIcon, countSpan, isLiked, likeCount);
}

function handleEditButtonClick(
  comment,
  contentEl,
  actionDiv,
  commentContainer
) {
  // Create edit container
  const editContainer = document.createElement("div");
  editContainer.className = "edit-comment-container";
  editContainer.style.display = "flex";
  editContainer.style.gap = "8px";
  editContainer.style.flex = "1";

  // Create input
  const input = document.createElement("input");
  input.type = "text";
  input.className = "md-text-field-input";
  input.value = contentEl.textContent;
  input.style.flex = "1";
  input.style.margin = "0";
  input.style.padding = "4px 8px";
  input.style.height = "28px";

  // Buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.gap = "4px";

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "md-button md-button-contained";
  saveBtn.textContent = "Save";
  saveBtn.style.padding = "4px 8px";
  saveBtn.style.minWidth = "auto";

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "md-button md-button-outlined";
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "4px 8px";
  cancelBtn.style.minWidth = "auto";

  buttonsContainer.appendChild(saveBtn);
  buttonsContainer.appendChild(cancelBtn);
  editContainer.appendChild(input);
  editContainer.appendChild(buttonsContainer);

  contentEl.style.display = "none";
  contentEl.parentNode.insertBefore(editContainer, contentEl);
  actionDiv.style.display = "none";
  input.focus();

  saveBtn.onclick = async (e) => {
    e.preventDefault();
    const newContent = input.value.trim();
    if (!newContent) return;

    try {
      const response = await fetch(`${BASE_URL}/update_comment/${comment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
        body: JSON.stringify({ updated_content: newContent }),
      });

      if (!response.ok) throw new Error("Failed to update comment");

      contentEl.textContent = newContent;
      contentEl.style.display = "";
      editContainer.remove();
      actionDiv.style.display = "flex";

      isProfilePage ? await loadUserTweets() : await loadTweets();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  cancelBtn.onclick = (e) => {
    e.preventDefault();
    contentEl.style.display = "";
    editContainer.remove();
    actionDiv.style.display = "flex";
  };
}

function setupCommentForm(commentForm, tweetId) {
  if (!commentForm) return;

  const commentInput = commentForm.querySelector(".comment-input");
  if (!commentInput) return;

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = commentInput.value.trim();
    if (!content) return;

    await handleComment(tweetId, content);
    commentInput.value = "";
    isProfilePage ? await loadUserTweets() : await loadTweets();
  });
}

function renderTweets(tweetsData) {
  const tweetsDiv = document.getElementById(
    isProfilePage ? "userTweets" : "tweets"
  );
  if (!tweetsDiv) return;

  tweetsDiv.innerHTML = "";

  tweetsData.forEach((tweetData) => {
    if (tweetData.tweet && tweetData.tweet.content) {
      const tweetElement = renderTweet(tweetData);
      tweetsDiv.appendChild(tweetElement);
    }
  });
}
async function handleSearch(searchQuery) {
  try {
    const response = await fetch(`${BASE_URL}/load_feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ search_query: searchQuery }),
    });

    if (!response.ok) throw new Error("Failed to search tweets");
    const data = await response.json();

    if (data.reports && data.reports.length > 0) {
      const summaryElement = document.getElementById("feed-summary");
      if (summaryElement) {
        summaryElement.textContent = data.reports[0].summary || "";
      }

      const transformedTweets = data.reports[0].feeds.map((feed) => ({
        tweet: {
          username: feed.Tweet_Info.context.username || "Anonymous",
          content: {
            id: feed.Tweet_Info.context.id,
            content: feed.Tweet_Info.context.content,
            comments: feed.Tweet_Info.context.comments || [],
          },
          likes: feed.Tweet_Info.context.likes || [],
        },
      }));

      renderTweets(transformedTweets);
    }
  } catch (error) {
    console.error("Error searching tweets:", error);
    const tweetsDiv = document.getElementById("tweets");
    if (tweetsDiv) {
      tweetsDiv.innerHTML =
        '<div class="md-card md-tweet"><div class="md-card-content">Error searching tweets</div></div>';
    }
  }
}

async function processSearchResponse(response) {
  if (!response.ok) throw new Error("Failed to search tweets");
  const data = await response.json();
  if (data.reports && data.reports.length > 0) {
    const summaryElement = document.getElementById("feed-summary");
    if (summaryElement) {
      summaryElement.textContent = data.reports[0].summary;
    }
    renderTweets(data.reports[0].feeds);
  }
}

const navSearchForm = document.getElementById("navSearchForm");
const contentSearchForm = document.getElementById("searchForm");
const navSearchInput = document.getElementById("navSearchQuery");
const contentSearchInput = document.getElementById("searchQuery");

function handleSearchInput(e) {
  const searchQuery = e.target.value;

  // Sync the other search input
  if (e.target === navSearchInput && contentSearchInput) {
    contentSearchInput.value = searchQuery;
  } else if (e.target === contentSearchInput && navSearchInput) {
    navSearchInput.value = searchQuery;
  }

  // If search is cleared, load all tweets
  if (!searchQuery) {
    loadTweets();
  }
}

if (navSearchInput) {
  navSearchInput.addEventListener("input", handleSearchInput);
}

if (contentSearchInput) {
  contentSearchInput.addEventListener("input", handleSearchInput);
}

async function handleSearchSubmit(e) {
  e.preventDefault();
  const searchInput = e.target.querySelector("input");
  const searchQuery = searchInput?.value?.trim();

  if (!searchQuery) {
    await loadTweets(); // If search is empty, load all tweets
    return;
  }

  await handleSearch(searchQuery);
}

if (navSearchForm) {
  navSearchForm.addEventListener("submit", handleSearchSubmit);
}

if (contentSearchForm) {
  contentSearchForm.addEventListener("submit", handleSearchSubmit);
}
if (!isProfilePage) {
  document
    .getElementById("tweetForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const content = document.getElementById("tweetContent").value.trim();
      if (!content) return;

      try {
        const response = await fetch(`${BASE_URL}/create_tweet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });
        if (!response.ok) throw new Error("Failed to create tweet");
        document.getElementById("tweetContent").value = "";
        loadTweets();
      } catch (error) {
        console.error("Error:", error);
      }
    });
}

async function handleLike(tweetId) {
  try {
    const response = await fetch(`${BASE_URL}/like_tweet/${tweetId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok)
      throw new Error(`Failed to like tweet: ${response.status}`);
    await response.text();
    return true;
  } catch (error) {
    console.error("Error handling like:", error);
    return false;
  }
}

async function handleRemoveLike(tweetId) {
  try {
    const response = await fetch(`${BASE_URL}/remove_like/${tweetId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok)
      throw new Error(`Failed to remove like: ${response.status}`);
    await response.text();
    return true;
  } catch (error) {
    console.error("Error removing like:", error);
    return false;
  }
}

async function handleComment(tweetId, content) {
  try {
    const response = await fetch(`${BASE_URL}/comment_tweet/${tweetId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("Failed to add comment");

    if (isProfilePage) {
      await loadUserTweets();
    } else {
      await loadTweets();
    }

    return true;
  } catch (error) {
    console.error("Error posting comment:", error);
    return false;
  }
}

async function loadTweets() {
  try {
    const response = await fetch(`${BASE_URL}/load_feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Failed to load tweets");
    const data = await response.json();

    if (data.reports && data.reports.length > 0) {
      const summaryElement = document.getElementById("feed-summary");
      if (summaryElement) {
        summaryElement.textContent = data.reports[0].summary;
      }

      const transformedTweets = data.reports[0].feeds.map((feed) => {
        return {
          tweet: {
            username: feed.context?.username || "Anonymous",
            content: feed.context,
            likes: feed.context.likes || [],
            comments: feed.context.comments || [],
          },
        };
      });

      renderTweets(transformedTweets);
    }
  } catch (error) {
    console.error("Error loading tweets:", error);
    const tweetsDiv = document.getElementById("tweets");
    if (tweetsDiv) {
      tweetsDiv.innerHTML =
        '<div class="md-card md-tweet"><div class="md-card-content">Error loading tweets</div></div>';
    }
  }
}

async function loadUserTweets() {
  try {
    const response = await fetch(`${BASE_URL}/load_tweets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        if_report: true,
        tweets: ["string"],
      }),
    });

    if (!response.ok) throw new Error("Failed to load tweets");
    const data = await response.json();

    if (data.reports && data.reports.length > 0) {
      // Get the tweets array from the first element of reports
      const tweets = data.reports[0];

      // Transform the data to match the expected structure
      const transformedTweets = tweets.map((tweet) => ({
        tweet: {
          username: tweet.context?.username || "Anonymous",
          content: tweet.context, // Contains id, content, and other details
          likes: tweet.context.likes || [],
          comments: tweet.context.comments || [],
        },
      }));

      renderTweets(transformedTweets);
    }
  } catch (error) {
    console.error("Error loading user tweets:", error);
    const tweetsDiv = document.getElementById("userTweets");
    if (tweetsDiv) {
      tweetsDiv.innerHTML =
        '<div class="md-card-content">Error loading tweets</div>';
    }
  }
}

async function handleDelete(tweetId) {
  try {
    const response = await fetch(`${BASE_URL}/remove_tweet/${tweetId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete tweet");

    // Reload tweets after successful deletion
    await loadUserTweets();
    return true;
  } catch (error) {
    console.error("Error deleting tweet:", error);
    return false;
  }
}

async function loadFollowingUsers() {
  try {
    // First load the current user's profile to get following list
    const profileResponse = await fetch(`${BASE_URL}/get_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!profileResponse.ok) throw new Error("Failed to load profile");
    const profileData = await profileResponse.json();

    const followingListElement = document.getElementById("followingList");
    if (!followingListElement) return;

    followingListElement.innerHTML = "";

    if (profileData.reports && profileData.reports[0].followers) {
      const followers = profileData.reports[0].followers;

      if (followers.length === 0) {
        const noFollowingMsg = document.createElement("div");
        noFollowingMsg.className = "md-list-item";
        noFollowingMsg.textContent = "You're not following anyone yet";
        followingListElement.appendChild(noFollowingMsg);
        return;
      }

      followers.forEach((profile) => {
        const template = document.getElementById("following-template");
        if (!template) return;

        const profileElement = template.content.cloneNode(true);

        // Set the username
        profileElement.querySelector(".profile-name").textContent =
          profile.username;

        // Create and add unfollow button
        const unfollowBtn = document.createElement("button");
        unfollowBtn.className = "md-button unfollow-btn";
        unfollowBtn.textContent = "Unfollow";

        // Add click handler for unfollow
        unfollowBtn.addEventListener("click", async () => {
          try {
            const response = await fetch(
              `${BASE_URL}/un_follow_request/${profile.id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  Accept: "*/*",
                },
              }
            );

            if (!response.ok) throw new Error("Failed to unfollow user");

            // Reload the following list after successful unfollow
            await loadFollowingUsers();
          } catch (error) {
            console.error("Error unfollowing user:", error);
          }
        });

        // Add the button to the list item
        const listItem = profileElement.querySelector(".md-list-item");
        listItem.appendChild(unfollowBtn);

        followingListElement.appendChild(profileElement);
      });
    }
  } catch (error) {
    console.error("Error loading following users:", error);
    const followingListElement = document.getElementById("followingList");
    if (followingListElement) {
      followingListElement.innerHTML =
        '<div class="md-list-item">Error loading following users</div>';
    }
  }
}

let lastScrollPosition = 0;

function saveScrollPosition() {
  const tweetsContainer = document.querySelector(".scrollable-tweets");
  if (tweetsContainer) {
    lastScrollPosition = tweetsContainer.scrollTop;
  }
}

function restoreScrollPosition() {
  const tweetsContainer = document.querySelector(".scrollable-tweets");
  if (tweetsContainer) {
    tweetsContainer.scrollTop = lastScrollPosition;
  }
}

document.querySelector(".scrollable-tweets")?.addEventListener("scroll", () => {
  saveScrollPosition();
});

async function initializePage() {
  try {
    await loadCurrentUserProfile();
    if (isProfilePage) {
      await loadUserTweets();
      await loadFollowingUsers();
    } else {
      await loadTweets();
      await loadProfilesToFollow();
    }
    restoreScrollPosition();
  } catch (error) {
    console.error("Page initialization error:", error);
  }
}

function handleResize() {
  const searchFormCard = document.querySelector(".search-form-card");
  const navSearchForm = document.querySelector(".nav-search-form");

  if (window.innerWidth <= 960) {
    searchFormCard?.style.setProperty("display", "block", "important");
    navSearchForm?.style.setProperty("display", "none", "important");
  } else {
    searchFormCard?.style.setProperty("display", "none", "important");
    navSearchForm?.style.setProperty("display", "flex", "important");
  }
}

window.addEventListener("resize", handleResize);

handleResize();

initializePage();

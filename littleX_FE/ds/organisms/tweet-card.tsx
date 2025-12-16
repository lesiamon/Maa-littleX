import {
  EditIcon,
  Heart,
  MessageCircle,
  Trash2Icon,
  Send,
  X,
  MoreVertical,
  Share2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../atoms/card";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/avatar";
import { EditTweetDialog } from "../molecules/edit-tweet-dialog";
import { User } from "@/store/tweetSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../atoms/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../atoms/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../atoms/collapsible";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { Textarea } from "../atoms/textarea";
import { JSX, useState, useEffect } from "react";
import { useAppDispatch } from "@/store/useStore";
import { private_api } from "@/_core/api-client";
import {
  deleteTweetAction,
  likeTweetAction,
  removeLikeAction,
  addCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from "@/modules/tweet";
import { Comment } from "@/nodes/tweet-node";
import { cn } from "@/_core/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu";
import { getTimeDifference } from "@/modules/tweet/utils";

// Define interfaces
export interface TweetCardProps {
  id: string;
  username: string;
  content: string;
  likes: string[];
  comments: Comment[];
  profile: User;
  created_at?: string;
}

interface LikesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  likes: string[];
}

interface CommentsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  comments: Comment[];
  loginUsername: string;
  onEditComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  commentInputValue: string;
  setCommentInputValue: (value: string) => void;
  handleSubmitComment: () => void;
  editingComment: Comment | null;
  onCancelEdit: () => void;
}

interface ActionDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  menuWidth?: string;
  iconSize?: number;
}

// Extracted dialog components
function LikesDialog({
  isOpen,
  onOpenChange,
  likes,
}: LikesDialogProps): JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {likes.length > 0 ? (
            likes.map((likeUsername, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <Avatar className="size-8">
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?u=${likeUsername}`}
                  />
                  <AvatarFallback className="text-xs">
                    {(likeUsername || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{likeUsername}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No likes yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommentsDialog({
  isOpen,
  onOpenChange,
  comments,
  loginUsername,
  onEditComment,
  onDeleteComment,
  commentInputValue,
  setCommentInputValue,
  handleSubmitComment,
  editingComment,
  onCancelEdit,
}: CommentsDialogProps): JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {comments.length > 0 ? (
            <div className="overflow-y-auto pr-1 max-h-[60vh]">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="size-6">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${comment?.username}`}
                    />
                    <AvatarFallback className="text-xs">
                      {(comment.username || "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">
                          {comment.username}
                        </span>
                        {comment.username.toLowerCase() ===
                          loginUsername.toLowerCase() && (
                          <ActionDropdown
                            onEdit={() => onEditComment(comment)}
                            onDelete={() => onDeleteComment(comment.id)}
                          />
                        )}
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                    <div className="flex gap-4 mt-1 ml-1">
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        Like
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Comment input section */}
        <div className="py-3 border-t border-border">
          {editingComment && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Editing comment
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                className="h-6 px-2"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={`https://i.pravatar.cc/150?u=${loginUsername}`}
              />
              <AvatarFallback>{(loginUsername || "?")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <Input
              type="text"
              value={commentInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCommentInputValue(e.target.value)
              }
              placeholder={
                editingComment ? "Edit your comment..." : "Add a comment..."
              }
              className="flex-1 h-9 bg-background text-sm border border-input rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              className="rounded-full h-9 px-2.5 text-primary-foreground"
              onClick={handleSubmitComment}
              disabled={!commentInputValue.trim()}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionDropdown({
  onEdit,
  onDelete,
  menuWidth = "w-20",
  iconSize = 4,
}: ActionDropdownProps): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className={`text-muted-foreground size-${iconSize}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuWidth}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            Edit
            <DropdownMenuShortcut>
              <EditIcon />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>
            Delete
            <DropdownMenuShortcut>
              <Trash2Icon />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TweetCard({
  id,
  username,
  content,
  likes,
  comments,
  profile,
  created_at,
}: TweetCardProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isLikesDialogOpen, setIsLikesDialogOpen] = useState<boolean>(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] =
    useState<boolean>(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);

  // Combined state for both adding and editing comments
  const [commentInputValue, setCommentInputValue] = useState<string>("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  // Fetch analysis when dialog opens
  useEffect(() => {
    if (isAnalysisDialogOpen && !analysisData) {
      const fetchAnalysis = async () => {
        setAnalysisLoading(true);
        try {
          const response = await private_api.post("/assistant/analyze_tweet", {
            content: content,
          });
          setAnalysisData(response.data);
        } catch (error) {
          console.error("Error analyzing tweet:", error);
          setAnalysisData({ error: "Failed to analyze tweet" });
        } finally {
          setAnalysisLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [isAnalysisDialogOpen, analysisData, content]);

  const loginUsername: string = profile.username;

  const liked: boolean = !!likes.find(
    (person) => person.toLowerCase() === loginUsername.toLowerCase()
  );

  const handleLike = (id: string): void => {
    if (liked) {
      dispatch(removeLikeAction({ id, username: loginUsername }));
    } else {
      dispatch(likeTweetAction({ id, username: loginUsername }));
    }
  };

  const handleSubmitComment = (): void => {
    if (!commentInputValue.trim()) return;

    if (editingComment) {
      // Editing existing comment
      dispatch(
        updateCommentAction({
          tweetId: id,
          id: editingComment.id,
          username: loginUsername,
          content: commentInputValue.trim(),
        })
      );
      setEditingComment(null);
    } else {
      // Adding new comment
      dispatch(
        addCommentAction({
          tweetId: id,
          username: loginUsername,
          content: commentInputValue.trim(),
        })
      );
    }
    setCommentInputValue("");
  };

  const handleDeleteComment = (commentId: string): void => {
    dispatch(deleteCommentAction({ tweetId: id, id: commentId }));
  };

  const openEditComment = (comment: Comment): void => {
    setEditingComment(comment);
    setCommentInputValue(comment.content);
  };

  const cancelEditComment = (): void => {
    setEditingComment(null);
    setCommentInputValue("");
  };
  const timeAgo = created_at
    ? getTimeDifference(created_at)
    : getTimeDifference(new Date().toUTCString());
  return (
    <>
      <Card className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <CardHeader className="p-4 flex flex-row justify-between w-full items-start">
          <div className="flex gap-3">
            <Avatar className="size-8">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${username}`} />
              <AvatarFallback>{(username || "?")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">{username || "Anonymous"}</h3>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          {username.toLowerCase() === loginUsername.toLowerCase() && (
            <ActionDropdown
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={() => dispatch(deleteTweetAction(id))}
            />
          )}
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-card-foreground mb-2 whitespace-pre-wrap wrap">
            {content}
          </p>
          {/* AI Avatar Analysis Panel - Click to expand */}
          <button
            onClick={() => setIsAnalysisDialogOpen(true)}
            className="w-full mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg hover:border-purple-500/40 hover:from-purple-500/15 hover:to-blue-500/15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Click for AI Analysis</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 text-left">
              <div>📰 <span className="font-medium">Article Detection:</span> Analyzing...</div>
              <div>🛍️ <span className="font-medium">Product Detection:</span> Checking...</div>
              <div>📍 <span className="font-medium">Place Detection:</span> Identifying...</div>
            </div>
          </button>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch p-0">
          <div className="border-t border-border px-4 py-3 ">
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <Heart
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleLike(id);
                  }}
                  size={18}
                  fill={liked ? "hsl(22, 89%, 52%)" : "none"}
                  className="mr-1"
                />
                <button
                  onClick={() => setIsLikesDialogOpen(true)}
                  className={`hover:text-foreground text-nowrap ${
                    liked ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {likes.length} Likes
                </button>
              </div>

              <button
                onClick={() => setIsCommentsDialogOpen(true)}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <MessageSquare size={18} className="mr-1" />
                <span className="text-nowrap">{comments.length} Comments</span>
              </button>
            </div>
          </div>
          {/* Quick add comment */}
          <div className="px-4 py-3 border-t border-border flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={`https://i.pravatar.cc/150?u=${loginUsername}`}
              />
              <AvatarFallback>{(loginUsername || "?")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <Input
              type="text"
              value={commentInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCommentInputValue(e.target.value)
              }
              placeholder="Add a comment..."
              className="flex-1 h-9 bg-background text-sm border border-input rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              className="rounded-full h-9 px-2.5 text-primary-foreground"
              onClick={handleSubmitComment}
              disabled={!commentInputValue.trim()}
            >
              <Send className="size-4 " />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <EditTweetDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tweetId={id}
        initialContent={content}
      />

      <LikesDialog
        isOpen={isLikesDialogOpen}
        onOpenChange={setIsLikesDialogOpen}
        likes={likes}
      />

      <CommentsDialog
        isOpen={isCommentsDialogOpen}
        onOpenChange={setIsCommentsDialogOpen}
        comments={comments}
        loginUsername={loginUsername}
        onEditComment={openEditComment}
        onDeleteComment={handleDeleteComment}
        commentInputValue={commentInputValue}
        setCommentInputValue={setCommentInputValue}
        handleSubmitComment={handleSubmitComment}
        editingComment={editingComment}
        onCancelEdit={cancelEditComment}
      />

      {/* AI Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              AI Analysis Results
            </DialogTitle>
          </DialogHeader>
          
          {analysisLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-purple-500" />
              <span className="ml-2 text-muted-foreground">Analyzing tweet...</span>
            </div>
          ) : analysisData?.error ? (
            <div className="text-sm text-red-500 py-4">
              {analysisData.error}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Article Detection */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                  <span>📰</span> Article Detection ({analysisData?.articles?.length || 0})
                </h3>
                {analysisData?.articles && analysisData.articles.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisData.articles.map((article: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        <span className="font-medium">{article.title || article.topic}</span>
                        {article.url && (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-2"
                          >
                            Link
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No articles detected</p>
                )}
              </div>

              {/* Product Detection */}
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2 mb-2">
                  <span>🛍️</span> Product Detection ({analysisData?.products?.length || 0})
                </h3>
                {analysisData?.products && analysisData.products.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisData.products.map((product: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {product.name || product}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No products detected</p>
                )}
              </div>

              {/* Place Detection */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-2">
                  <span>📍</span> Place Detection ({analysisData?.places?.length || 0})
                </h3>
                {analysisData?.places && analysisData.places.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisData.places.map((place: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {place.name || place.location || place}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No places detected</p>
                )}
              </div>

              {/* Language Support */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-2">
                  <span>🌐</span> Analysis Info
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tweet content analyzed using GPT for intelligent detection of articles, products, and locations.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

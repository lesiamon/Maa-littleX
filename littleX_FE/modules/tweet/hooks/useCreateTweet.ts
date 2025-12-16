"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TweetNode } from "@/nodes/tweet-node";
import { useTweets } from ".";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { createTweetAction, updateTweetAction } from "../actions";

interface UseTweetFormProps {
  onSuccess?: () => void;
  initialContent?: string;
  mode?: "create" | "edit";
  tweetId?: string;
}
const formSchema = z.object({
  content: z.string().nonempty("Content cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

export function useTweetForm({
  onSuccess,
  initialContent,
  mode = "create",
  tweetId,
}: UseTweetFormProps = {}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.users.user);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialContent || "",
    },
  });

  const onSubmit = async (values: Pick<TweetNode, "content">) => {
    const username = user?.username || "guest";

    if (mode === "edit" && tweetId) {
      dispatch(
        updateTweetAction({
          id: tweetId,
          content: values.content,
        })
      );
    } else {
      dispatch(
        createTweetAction({
          content: values.content,
          username: username,
        })
      );
    }
    form.reset();
    if (onSuccess) onSuccess();
  };

  return {
    form,
    onSubmit,
  };
}

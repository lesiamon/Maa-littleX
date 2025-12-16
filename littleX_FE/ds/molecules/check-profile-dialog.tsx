import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../atoms/dialog";
import { Input } from "../atoms/input";
import { useAppDispatch } from "@/store/useStore";
import { updateUserProfileAction } from "@/modules/tweet";

interface CheckProfileProps {
  open: boolean;
  isLoading?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CheckProfile = ({ open, isLoading = false, onOpenChange }: CheckProfileProps) => {
  const dispatch = useAppDispatch();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter username"
          disabled={isLoading}
          onKeyDown={(e) => {
            const target = e.target as HTMLInputElement;
            if (e.key === "Enter" && target.value.trim()) {
              dispatch(updateUserProfileAction(target.value.trim()));
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
export default CheckProfile;

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  onConfirm: (sectionName: string) => Promise<void>;
  loading?: boolean;
}

const DeleteSectionDialog = ({
  isOpen,
  onClose,
  sectionName,
  onConfirm,
  loading = false
}: DeleteSectionDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm(sectionName);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Section</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the section &quot;{sectionName}&quot;? This action will remove
            the section and all its associated questions. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Section
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSectionDialog;

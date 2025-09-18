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
import { Course } from "@/src/services/courseService";

interface DeleteCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onConfirm: (courseId: string) => Promise<void>;
  loading?: boolean;
}

const DeleteCourseDialog = ({
  isOpen,
  onClose,
  course,
  onConfirm,
  loading = false
}: DeleteCourseDialogProps) => {
  const handleConfirm = async () => {
    if (course) {
      await onConfirm(course.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{course?.title}&quot;? This action will deactivate the course
            and it will no longer be visible to students. This action cannot be undone.
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
            Delete Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCourseDialog;

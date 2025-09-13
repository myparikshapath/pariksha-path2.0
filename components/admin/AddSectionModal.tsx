// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";

// interface AddSectionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onAdd: (sectionName: string) => Promise<void>;
//   existingSections: string[];
//   loading?: boolean;
// }

// const AddSectionModal = ({ 
//   isOpen, 
//   onClose, 
//   onAdd, 
//   existingSections,
//   loading = false 
// }: AddSectionModalProps) => {
//   const [sectionName, setSectionName] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (sectionName.trim() && !existingSections.includes(sectionName.trim())) {
//       await onAdd(sectionName.trim());
//       setSectionName("");
//     }
//     onClose();
//   };

//   const handleClose = () => {
//     setSectionName("");
//     onClose();
//   };

//   const isDuplicate = existingSections.includes(sectionName.trim());

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add New Section</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="sectionName">Section Name</Label>
//             <Input
//               id="sectionName"
//               value={sectionName}
//               onChange={(e) => setSectionName(e.target.value)}
//               placeholder="e.g., Physics, Chemistry, Mathematics"
//               required
//               disabled={loading}
//             />
//             {isDuplicate && sectionName.trim() && (
//               <p className="text-sm text-red-600">
//                 A section with this name already exists.
//               </p>
//             )}
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               disabled={loading || !sectionName.trim() || isDuplicate}
//             >
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Add Section
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddSectionModal;

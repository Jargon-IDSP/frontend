import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

interface DeleteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void; // Add this prop
}

export default function AddToFolderDrawer({
  open,
  onOpenChange,
  onCancel,
}: DeleteDrawerProps) {
  //   const navigate = useNavigate();

  const handleCancel = () => {
    onOpenChange(false); // Close delete drawer
    if (onCancel) {
      setTimeout(() => {
        onCancel(); // Call the callback to reopen DocOptionsDrawer
      }, 200);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>
            <button>+ New folder</button>
            {/* Horizontal divider */}
            <hr className="my-2 border-gray-200 mb-4" />
          </DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            variant="outline"
            className="text-white bg-green-500"
            onClick={undefined}
          >
            Save
          </Button>
          {/* Horizontal divider */}
          <hr className="my-2 border-gray-200 mb-4" />
          <Button
            variant="outline"
            className="text-red-500 hover:bg-red-50"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import uploadIcon from "@/assets/icons/uploadIcon.svg";

interface DocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentDrawer({
  open,
  onOpenChange,
}: DocumentDrawerProps) {
  const navigate = useNavigate();

  const handleChooseFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        onOpenChange(false); // Close the drawer
        navigate("/documents/preview", {
          state: {
            fileName: target.files[0].name,
            fileSize: target.files[0].size,
            fileType: target.files[0].type,
            file: target.files[0],
          },
        });
      }
    };
    input.click();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>
            <h2>Upload your document</h2>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <div className="simple-upload-container">
            <div className="upload-header">
              <img src={uploadIcon} alt="upload" className="upload-icon" />
              <span className="upload-text">
                Upload your PDF, JPG/JPEG, or PNG file (max. 50 MB)
              </span>
            </div>
            <button
              onClick={handleChooseFile}
              className="btn btn-primary choose-file-button"
            >
              Choose file
            </button>
          </div>
          {/* Horizontal divider */}
          <hr className="my-2 border-gray-200 mb-4" />
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

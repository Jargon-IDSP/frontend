import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface DocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentDrawer({
  open,
  onOpenChange,
}: DocumentDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <DrawerFooter>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Translate Document
          </Button>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Generate a lesson
          </Button>
          <Button className="bg-[#6F2E17] text-white hover:bg-orange-90">
            Both
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

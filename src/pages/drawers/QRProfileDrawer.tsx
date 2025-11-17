import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface QRProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
  username?: string;
}

export default function QRProfileDrawer({
  open,
  onOpenChange,
  userId,
  displayName,
  username,
}: QRProfileDrawerProps) {
  const [copied, setCopied] = useState(false);
  const { showSuccessToast, showErrorToast } = useNotificationContext();

  // Use username for QR code if available, otherwise fall back to userId
  const qrCodeValue = username || userId;
  const profileUrl = `${window.location.origin}/profile/friends/${userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      showSuccessToast("Profile link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      showErrorToast("Failed to copy link", "Error");
    }
  };

  const handleDownloadQR = () => {
    try {
      const svg = document.getElementById("profile-qr-code");
      if (!svg) {
        showErrorToast("Failed to generate QR code", "Error");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${displayName.replace(/\s/g, "_")}_profile_qr.png`;
            link.click();
            URL.revokeObjectURL(url);
            showSuccessToast("QR code downloaded successfully!");
          }
        });
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (error) {
      showErrorToast("Failed to download QR code", "Error");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Share Profile</DrawerTitle>
          <DrawerDescription>
            Share {displayName}'s profile with a QR code or link
          </DrawerDescription>
        </DrawerHeader>

        <div className="qr-profile-drawer-content">
          <div className="qr-profile-drawer-qr-container">
            <QRCodeSVG
              id="profile-qr-code"
              value={qrCodeValue}
              size={200}
              level="H"
            />
          </div>

          <div className="qr-profile-drawer-link-section">
            <p className="qr-profile-drawer-link-label">Profile Link:</p>
            <div className="qr-profile-drawer-link-container">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="qr-profile-drawer-link-input"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="qr-profile-drawer-copy-button"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button onClick={handleDownloadQR} className="w-full">
            Download QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

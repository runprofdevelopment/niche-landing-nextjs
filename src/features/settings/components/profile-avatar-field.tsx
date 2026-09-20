"use client";

import { Pencil } from "lucide-react";
import { useRef } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { useFileStorage } from "@/services/firebase/storage/use-file-storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Spinner } from "@/shared/components/ui/spinner";

import type { StaffAvatarInput } from "../graphql/mutations/staff-update-profile";

type ProfileAvatarFieldProps = {
  initials: string;
  value: StaffAvatarInput | null;
  onChange: (avatar: StaffAvatarInput | null) => void;
};

export function ProfileAvatarField({ initials, value, onChange }: ProfileAvatarFieldProps) {
  const t = useTranslations("settings");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value?.publicUrl ?? null;
  const storage = useFileStorage({
    entityLabel: t("avatarLabel"),
    showSuccessToast: false,
  });

  const handleFileChange = async (file: File | null | undefined) => {
    if (!file) return;

    const existingPath = value?.privateUrl || value?.publicUrl || undefined;
    const result = existingPath
      ? await storage.replace({
          module: "staff",
          folder: "profilePhotos",
          existingPath,
          file,
        })
      : await storage.upload({
          module: "staff",
          folder: "profilePhotos",
          file,
        });

    if (!result) return;

    onChange({
      id: value?.id ?? "",
      name: file.name,
      new: true,
      privateUrl: result.path,
      publicUrl: result.downloadUrl,
      sizeInBytes: result.size,
    });
  };

  return (
    <div className="relative size-20 shrink-0">
      <Avatar className="size-20 border border-border bg-muted">
        <AvatarImage src={previewUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-muted text-lg font-semibold text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      {storage.uploading || storage.replacing ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
          <Spinner size="sm" />
        </div>
      ) : null}
      <button
        type="button"
        className="absolute bottom-0 end-0 flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
        disabled={storage.busy}
        aria-label={t("avatarEdit")}
        onClick={() => inputRef.current?.click()}
      >
        <Pencil className="size-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => void handleFileChange(event.target.files?.[0])}
      />
    </div>
  );
}

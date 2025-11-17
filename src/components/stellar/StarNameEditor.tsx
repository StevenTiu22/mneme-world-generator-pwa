import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Check, X, Info } from "lucide-react";

interface StarNameEditorProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function StarNameEditor({ name, onNameChange }: StarNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleSave = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setTempName(name);
    setIsEditing(true);
  };

  return (
    <div>
      <Label className="text-base mb-3 flex items-center gap-2">
        Star Name
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Give your primary star a unique name</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="text-xl font-semibold h-11 flex-1"
              placeholder="Enter star name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={!tempName.trim()}
              className="h-11 w-11 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold flex-1">{name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="h-11 w-11"
            >
              <Pencil className="h-5 w-5 text-muted-foreground" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

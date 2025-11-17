import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Minus, Plus, Info } from "lucide-react";

interface GradeControlProps {
  grade: number;
  onGradeChange: (grade: number) => void;
}

export function GradeControl({ grade, onGradeChange }: GradeControlProps) {
  const incrementGrade = () => {
    onGradeChange(Math.max(0, grade - 1));
  };

  const decrementGrade = () => {
    onGradeChange(Math.min(9, grade + 1));
  };

  return (
    <div>
      <Label className="text-base mb-3 flex items-center gap-2">
        Class Grade
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>0 = Brightest, 9 = Dimmest within the class</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <Card className="p-5">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={incrementGrade}
            disabled={grade === 0}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <div className="text-center min-w-[60px]">
            <div className="text-4xl font-bold">{grade}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {grade === 0 ? "Brightest" : grade === 9 ? "Dimmest" : "Grade"}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={decrementGrade}
            disabled={grade === 9}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

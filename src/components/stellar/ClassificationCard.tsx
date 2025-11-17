import { Card } from "@/components/ui/card";

interface ClassificationCardProps {
  selectedClass: string;
  classGrade: number;
  description?: string;
  color?: string;
  temperature?: string;
}

export function ClassificationCard({
  selectedClass,
  classGrade,
  description,
  color,
  temperature,
}: ClassificationCardProps) {
  return (
    <>
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Class {selectedClass}
              {classGrade}
            </h3>
            {description ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {description}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Color:</span>{" "}
                    <span className="font-medium">{color}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp:</span>{" "}
                    <span className="font-medium">{temperature}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading stellar data...
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
          Classification
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            {selectedClass}
            {classGrade} V
          </div>
          <div className="text-sm text-muted-foreground">Main Sequence Star</div>
        </div>
      </Card>
    </>
  );
}

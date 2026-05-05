import { FileText, MapPin, Package, User } from "lucide-react";

export function CompletarOrdenStepIcon({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <FileText className="size-4" />;
    case 1:
      return <User className="size-4" />;
    case 2:
      return <MapPin className="size-4" />;
    case 3:
      return <Package className="size-4" />;
    default:
      return null;
  }
}

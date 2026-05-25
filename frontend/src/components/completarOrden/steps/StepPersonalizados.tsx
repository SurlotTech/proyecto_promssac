import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  customFieldKeys,
  customFieldLabels,
  fieldInputClass,
  type CustomFieldKey,
} from "@/lib/completarOrden/constants";

interface Props {
  customFields: Record<CustomFieldKey, string>;
  onCustomFieldChange: (key: CustomFieldKey, value: string) => void;
}

const StepPersonalizados = ({ customFields, onCustomFieldChange }: Props) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {customFieldKeys.map((key) => (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={`cf-${key}`} className="text-sm text-muted-foreground">
          {customFieldLabels[key]}
        </Label>
        <Input
          id={`cf-${key}`}
          value={customFields[key]}
          onChange={(e) => onCustomFieldChange(key, e.target.value)}
          className={fieldInputClass}
        />
      </div>
    ))}
  </div>
);

export default StepPersonalizados;

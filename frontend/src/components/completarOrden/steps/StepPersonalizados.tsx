import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  customFieldKeys,
  customFieldLabels,
  fieldInputClass,
  type CustomFieldKey,
} from "@/lib/completarOrden/constants";
import {
  PERU_PHONE_DIGIT_COUNT,
  sanitizePeruNineDigitPhoneInput,
} from "@/lib/completarOrden/contactValidation";

interface Props {
  customFields: Record<CustomFieldKey, string>;
  onCustomFieldChange: (key: CustomFieldKey, value: string) => void;
}

const StepPersonalizados = ({ customFields, onCustomFieldChange }: Props) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {customFieldKeys.map((key) =>
      key === "telefono_director" ? (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`cf-${key}`} className="text-xs text-muted-foreground">
            {customFieldLabels[key]}
          </Label>
          <Input
            id={`cf-${key}`}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={PERU_PHONE_DIGIT_COUNT}
            placeholder="Ej. 987654321"
            aria-describedby={`cf-${key}-hint`}
            pattern={`[0-9]{0,${PERU_PHONE_DIGIT_COUNT}}`}
            value={customFields[key]}
            onChange={(e) =>
              onCustomFieldChange(key, sanitizePeruNineDigitPhoneInput(e.target.value))
            }
            className={fieldInputClass}
          />
          <p id={`cf-${key}-hint`} className="text-[11px] text-muted-foreground">
            Solo números (máximo {PERU_PHONE_DIGIT_COUNT}); si lo completas, son exactamente {PERU_PHONE_DIGIT_COUNT} dígitos.
          </p>
        </div>
      ) : (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`cf-${key}`} className="text-xs text-muted-foreground">
            {customFieldLabels[key]}
          </Label>
          <Input
            id={`cf-${key}`}
            value={customFields[key]}
            onChange={(e) => onCustomFieldChange(key, e.target.value)}
            className={fieldInputClass}
          />
        </div>
      ),
    )}
  </div>
);

export default StepPersonalizados;

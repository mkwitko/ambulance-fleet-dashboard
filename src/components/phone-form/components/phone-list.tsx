import { AnimatePresence } from "framer-motion";
import PhoneField from "./phone-field";

export interface PhoneListProps {
  phones: {
    id?: string;
    number: string;
    name?: string | null;
  }[];
  onRemovePhone: (index: number) => void;
}

export default function PhoneList({ phones, onRemovePhone }: PhoneListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {phones.map((phone, index) => (
          <PhoneField
            key={phone.id ?? index}
            phone={phone}
            onRemove={() => onRemovePhone(index)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SelectProps } from "@radix-ui/react-select";

type Item = {
  label: string;
  value: string;
};

interface AppSelectProps extends SelectProps {
  label?: string;
  items?: Item[];
  emptyMessage?: string;
  disabledMessage?: string;
  placeholder?: string;
  loading?: boolean;
  className?: string;
  clearable?: boolean;
}

export function AppSelect({
  label,
  value,
  onValueChange,
  items = [],
  emptyMessage = "Nenhum item encontrado",
  disabledMessage = "Selecione um valor anterior",
  placeholder = "Selecione...",
  loading = false,
  disabled,
  className,
  clearable = false,
  ...props
}: AppSelectProps) {
  const hasItems = items.length > 0;
  const isDisabled = disabled || loading;
  const hasValue = value && value !== "";

  // Wrapper elegante que previne valores vazios
  const handleValueChange = (newValue: string) => {
    if (newValue && onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onValueChange) {
      onValueChange("");
    }
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <Select
        disabled={isDisabled}
        value={value}
        onValueChange={handleValueChange}
        {...props}
      >
        <SelectTrigger className={className}>
          <SelectValue
            placeholder={
              loading
                ? "Carregando..."
                : disabled
                ? disabledMessage
                : placeholder
            }
          />
          {clearable && hasValue && !isDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-auto mr-2 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </SelectTrigger>

        {!isDisabled && (
          <SelectContent>
            <SelectGroup>
              {label && <SelectLabel>{label}</SelectLabel>}

              <AnimatePresence mode="sync" initial={false}>
                {/* LOADING */}
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </motion.div>
                )}

                {/* EMPTY */}
                {!loading && !hasItems && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 py-2 text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </motion.div>
                )}

                {/* ITENS */}
                {!loading &&
                  hasItems &&
                  items.map((item) => (
                    <motion.div
                      key={item.value}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <SelectItem value={item.value}>{item.label}</SelectItem>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </SelectGroup>
          </SelectContent>
        )}
      </Select>
    </div>
  );
}

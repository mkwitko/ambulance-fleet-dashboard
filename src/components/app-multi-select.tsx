import { useState } from "react";
import { Check, X, Loader2, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Item = {
  label: string;
  value: string;
};

interface AppMultiSelectProps {
  label?: string;
  items?: Item[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onRemovedValue?: (value: string) => void;
  emptyMessage?: string;
  disabledMessage?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function AppMultiSelect({
  label,
  items = [],
  value = [],
  onValueChange,
  onRemovedValue,
  emptyMessage = "Nenhum item encontrado",
  disabledMessage = "Selecione um valor anterior",
  placeholder = "Selecione...",
  loading = false,
  disabled = false,
}: AppMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasItems = items.length > 0;
  const isDisabled = disabled || loading;

  const toggleItem = (itemValue: string) => {
    if (!onValueChange) return;

    const newValue = value.includes(itemValue)
      ? value.filter((v) => v !== itemValue)
      : [...value, itemValue];

    onValueChange(newValue);
    setIsOpen(false);
  };

  const removeItem = (itemValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onValueChange) return;
    onValueChange(value.filter((v) => v !== itemValue));
    if (onRemovedValue) {
      onRemovedValue(itemValue);
    }
  };

  const getDisplayText = () => {
    if (loading) return "Carregando...";
    if (disabled) return disabledMessage;
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const item = items.find((i) => i.value === value[0]);
      return item?.label || placeholder;
    }
    return `${value.length} selecionados`;
  };

  return (
    <div className="flex w-full flex-col gap-1 relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className="border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex flex-wrap gap-1 flex-1 items-center line-clamp-1 overflow-hidden">
          {value.length > 0 && value.length <= 3 ? (
            items
              .filter((item) => value.includes(item.value))
              .map((item) => (
                <span
                  key={item.value}
                  className="inline-flex items-center gap-1 rounded bg-primary/70 hover:bg-primary hover:scale-[102%] transition-all duration-300 text-white px-2 py-0.5 text-xs"
                >
                  {item.label}
                  {!isDisabled && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => removeItem(item.value, e)}
                    />
                  )}
                </span>
              ))
          ) : (
            <span className={value.length === 0 ? "text-muted-foreground" : ""}>
              {getDisplayText()}
            </span>
          )}
        </div>
        <ChevronDown className="size-4 opacity-50 shrink-0 pointer-events-none" />
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && !isDisabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 w-full max-h-96 min-w-32 origin-top overflow-x-hidden overflow-y-auto rounded-md border shadow-md"
            >
              <div className="p-1">
                {label && (
                  <div className="text-muted-foreground px-2 py-1.5 text-xs">
                    {label}
                  </div>
                )}

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

                  {/* ITEMS */}
                  {!loading && hasItems && (
                    <>
                      {items.map((item) => {
                        const isSelected = value.includes(item.value);
                        return (
                          <motion.div
                            key={item.value}
                            initial={{ opacity: 0, y: -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            <div
                              onClick={() => toggleItem(item.value)}
                              className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                            >
                              <span className="flex items-center gap-2">
                                {item.label}
                              </span>
                              <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                {isSelected && <Check className="size-4" />}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

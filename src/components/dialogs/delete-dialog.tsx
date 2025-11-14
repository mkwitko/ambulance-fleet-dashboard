import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DeleteDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  itemName?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  message?: string;
}

export function DeleteDialog({
  open,
  setOpen,
  itemName,
  onConfirm,
  isLoading = false,
  title = "Atenção",
  message,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-connect">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col space-y-1.5"
        >
          {message ? (
            <p className="text-sm text-accent-foreground/40 leading-relaxed">
              {message}
            </p>
          ) : (
            <>
              <p className="text-sm text-accent-foreground/40 leading-relaxed">
                Tem certeza que deseja excluir este item?
              </p>
              {itemName && (
                <span className="font-medium text-foreground truncate">
                  {itemName}
                </span>
              )}
              <p className="text-sm text-accent-foreground/40 leading-relaxed">
                Esta ação é irreversível e removerá permanentemente o registro.
              </p>
            </>
          )}
        </motion.div>

        <DialogFooter className="flex justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

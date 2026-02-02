import { jumpingEnter } from "@/components/motion/jumping-enter";
import { rotatingScale } from "@/components/motion/rotate";
import { softEnter } from "@/components/motion/soft-enter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Phone, Sparkles, PlusCircle } from "lucide-react";
export default function EmptyPhoneForm({
  handleAddPhone,
  canCreate,
}: {
  handleAddPhone: () => void;
  canCreate: boolean;
}) {
  return (
    <motion.div
      key="empty"
      {...softEnter(0.25)}
      className="relative overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-2xl border-muted-foreground/20 from-muted/30 via-muted/20 to-transparent">
        <motion.div {...jumpingEnter}>
          <div className="relative">
            <Phone className="w-14 h-14 text-muted-foreground/60 mb-4" />
            <motion.div className="absolute -top-1 -right-1" {...rotatingScale}>
              <Sparkles className="w-5 h-5 text-primary/60" />
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          {...softEnter(0.25)}
          className="text-base font-medium text-muted-foreground mb-2"
        >
          Nenhum telefone adicionado
        </motion.p>
        <motion.p
          {...softEnter(0.5)}
          className="text-sm text-muted-foreground/70 mb-6"
        >
          Adicione seu primeiro número para começar
        </motion.p>

        <Button
          type="button"
          variant="default"
          onClick={handleAddPhone}
          animated
          disabled={!canCreate}
        >
          <PlusCircle className="w-4 h-4" />
          {canCreate ? "Adicionar Telefone" : "Sem Permissão para Adicionar"}
        </Button>
      </div>
    </motion.div>
  );
}

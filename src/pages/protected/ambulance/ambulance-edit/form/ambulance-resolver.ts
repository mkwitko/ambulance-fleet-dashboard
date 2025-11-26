import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type AmbulanceFormValues, ambulanceSchema } from "./ambulance-schema";

export const useAmbulanceResolver = () => {
    // Form
    const formMethods = useForm<AmbulanceFormValues>({
      resolver: zodResolver(ambulanceSchema),
      mode: "all",
    });

    return formMethods;
}
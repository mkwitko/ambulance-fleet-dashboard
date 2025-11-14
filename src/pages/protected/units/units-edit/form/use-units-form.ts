import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { unitSchema, type UnitFormValues } from './units-schema';

export default function useUnitsForm() {
    const formMethods = useForm<UnitFormValues>({
      resolver: zodResolver(unitSchema),
    });

    return {
      ...formMethods,
    }
}

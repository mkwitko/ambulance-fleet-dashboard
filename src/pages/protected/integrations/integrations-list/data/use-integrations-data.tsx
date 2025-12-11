// import type {
//   Action,
//   Column,
// } from "@/components/ui/data-table/data-table-types";
// import type { GetIntegrations200DataItem } from "@/http/generated/connectServer.schemas";
// import { Edit, Trash } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function useIntegrationsData({
//   handleDelete,
// }: {
//   handleDelete: (row: GetIntegrations200DataItem) => void;
// }) {
//   const navigate = useNavigate();

//   const columns: Column<GetIntegrations200DataItem>[] = [
//     { key: "name", label: "Integração" },

//     {
//       key: "companies",
//       label: "Vínculos",
//       render: (row) => {
//         const { companyGroup, companies, units } = row;

//         const parts: string[] = [];

//         if (companyGroup) {
//           parts.push(`Grupo: ${companyGroup.name}`);
//         }

//         if (companies && companies.length > 0) {
//           parts.push(`Empresas: ${companies.map((c) => c.name).join(", ")}`);
//         }

//         if (units && units.length > 0) {
//           parts.push(`Unidades: ${units.map((u) => u.name).join(", ")}`);
//         }

//         if (parts.length === 0) {
//           return <span className="text-muted-foreground">—</span>;
//         }

//         return (
//           <div className="flex flex-col gap-1 text-sm">
//             {parts.map((p, i) => (
//               <span key={i}>{p}</span>
//             ))}
//           </div>
//         );
//       },
//     },
//   ];

//   const actions: Action<GetIntegrations200DataItem>[] = [
//     {
//       label: "Editar",
//       onClick: (r: GetIntegrations200DataItem) => navigate(r.id),
//       icon: (
//         <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
//       ),
//     },
//     {
//       label: "Excluir",
//       onClick: handleDelete,
//       icon: (
//         <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
//       ),
//       type: "destructive",
//     },
//   ];

//   return {
//     columns,
//     actions,
//   };
// }

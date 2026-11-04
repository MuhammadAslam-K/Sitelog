import React from 'react';
import { 
  Edit3, 
  Trash2, 
  Boxes, 
  Building2, 
  Calendar, 
  UserCheck, 
  Scale,
  Truck,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function MaterialTable({
  materials = [],
  onEditMaterial,
  onDeleteMaterial
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Boxes className="w-3 h-3 text-blue-600" />
            <span>Received</span>
          </span>
        );
      case 'Pending Payment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Pay</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>In Transit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'Recorded'}
          </span>
        );
    }
  };

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Boxes className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Material Entries Found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No material supplies match your filter or search criteria. Try adjusting filters or record a new material delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Project</th>
            <th className="py-3 px-4">Material Item</th>
            <th className="py-3 px-4">Quantity</th>
            <th className="py-3 px-4">Agent / Supplier</th>
            <th className="py-3 px-4 text-right">Amount (₹)</th>
            <th className="py-3 px-4">Logistics / Challan</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-150">
          {materials.map((mat) => (
            <tr
              key={mat.materialId || mat.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* ID */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span className="font-mono font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200">
                  {mat.materialId}
                </span>
              </td>

              {/* Date */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{mat.date}</span>
                </div>
              </td>

              {/* Project */}
              <td className="py-3 px-4 max-w-[180px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate" title={mat.projectName}>
                    {mat.projectName || mat.projectId}
                  </span>
                </div>
                {mat.projectId && (
                  <span className="text-[10px] font-mono text-slate-400 pl-5 block">
                    {mat.projectId}
                  </span>
                )}
              </td>

              {/* Material Item */}
              <td className="py-3 px-4 max-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-150">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block truncate" title={mat.item}>
                      {mat.item}
                    </span>
                    {mat.notes && (
                      <span className="text-[10px] text-slate-500 truncate block max-w-[180px]" title={mat.notes}>
                        {mat.notes}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Quantity */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                  <Scale className="w-3 h-3 text-slate-500" />
                  <span>{mat.quantity}</span>
                </span>
              </td>

              {/* Agent / Supplier */}
              <td className="py-3 px-4 max-w-[190px]">
                <div className="flex items-center gap-1.5 truncate" title={mat.agent}>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">
                    {mat.agent}
                  </span>
                </div>
              </td>

              {/* Amount */}
              <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 text-xs">
                {formatIndianCurrency(mat.amount)}
              </td>

              {/* Logistics & Challan */}
              <td className="py-3 px-4 whitespace-nowrap">
                {mat.vehicleNumber || mat.challanNo ? (
                  <div className="space-y-0.5">
                    {mat.vehicleNumber && (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>{mat.vehicleNumber}</span>
                      </div>
                    )}
                    {mat.challanNo && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>{mat.challanNo}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px] italic">—</span>
                )}
              </td>

              {/* Status */}
              <td className="py-3 px-4 text-center whitespace-nowrap">
                {getStatusBadge(mat.status)}
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                  {onEditMaterial && (
                    <button
                      onClick={() => onEditMaterial(mat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Edit Material"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onDeleteMaterial && (
                    <button
                      onClick={() => onDeleteMaterial(mat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

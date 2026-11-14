import React, { useState, useMemo } from 'react';
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
import { TablePagination } from '../common/TablePagination.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';

export function MaterialTable({
  materials = [],
  onEditMaterial,
  onDeleteMaterial
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(materials.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedMaterials = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return materials.slice(start, start + pageSize);
  }, [materials, safeCurrentPage, pageSize]);
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25">
            <CheckCircle2 className="w-3 h-3 text-[#0F8B78]" />
            <span>Paid</span>
          </span>
        );
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Boxes className="w-3 h-3 text-blue-600" />
            <span>Received</span>
          </span>
        );
      case 'Pending Payment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F4B740]/15 text-[#b27918] border border-[#F4B740]/30">
            <Clock className="w-3 h-3 text-[#b27918]" />
            <span>Pending Pay</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>In Transit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
            {status || 'Recorded'}
          </span>
        );
    }
  };

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-[#64748B] rounded-full flex items-center justify-center mx-auto mb-3">
          <Boxes className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#172B4D]">No Material Entries Found</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
          No material supplies match your filter or search criteria. Try adjusting filters or record a new material delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
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
        <tbody className="divide-y divide-[#E2E8F0]">
          {paginatedMaterials.map((mat) => (
            <tr
              key={mat.materialId || mat.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* ID */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span className="font-mono font-bold text-[#0F8B78] bg-[#0F8B78]/10 px-2 py-0.5 rounded border border-[#0F8B78]/20">
                  {mat.materialId}
                </span>
              </td>

              {/* Date */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-[#172B4D] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{formatDate(mat.date)}</span>
                </div>
              </td>

              {/* Project */}
              <td className="py-3 px-4 max-w-[180px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <span className="font-medium text-[#172B4D] truncate" title={mat.projectName}>
                    {mat.projectName || mat.projectId}
                  </span>
                </div>
                {mat.projectId && (
                  <span className="text-[10px] font-mono text-[#64748B] pl-5 block">
                    {mat.projectId}
                  </span>
                )}
              </td>

              {/* Material Item */}
              <td className="py-3 px-4 max-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0F8B78]/10 text-[#0F8B78] flex items-center justify-center shrink-0 border border-[#0F8B78]/20">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block truncate" title={mat.item}>
                      {mat.item}
                    </span>
                    {mat.notes && (
                      <span className="text-[10px] text-[#64748B] truncate block max-w-[180px]" title={mat.notes}>
                        {mat.notes}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Quantity */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-[#172B4D] font-mono font-bold text-xs border border-[#E2E8F0]">
                  <Scale className="w-3 h-3 text-[#64748B]" />
                  <span>{mat.quantity}</span>
                </span>
              </td>

              {/* Agent / Supplier */}
              <td className="py-3 px-4 max-w-[190px]">
                <div className="flex items-center gap-1.5 truncate" title={mat.agent}>
                  <UserCheck className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <span className="font-medium text-[#172B4D] truncate">
                    {mat.agent}
                  </span>
                </div>
              </td>

              {/* Amount */}
              <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-bold text-[#172B4D] text-xs">
                {formatIndianCurrency(mat.amount)}
              </td>

              {/* Logistics & Challan */}
              <td className="py-3 px-4 whitespace-nowrap">
                {mat.vehicleNumber || mat.challanNo ? (
                  <div className="space-y-0.5">
                    {mat.vehicleNumber && (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#172B4D]">
                        <Truck className="w-3 h-3 text-[#64748B]" />
                        <span>{mat.vehicleNumber}</span>
                      </div>
                    )}
                    {mat.challanNo && (
                      <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
                        <FileText className="w-3 h-3 text-[#64748B]" />
                        <span>{mat.challanNo}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[#64748B] text-[11px] italic">—</span>
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
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F8B78] hover:bg-[#0F8B78]/10 transition-colors"
                      title="Edit Material"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onDeleteMaterial && (
                    <button
                      onClick={() => onDeleteMaterial(mat)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50 transition-colors"
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

      {/* Table Pagination Component */}
      <TablePagination
        currentPage={safeCurrentPage}
        totalItems={materials.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
        itemName="materials"
      />
    </div>
  );
}

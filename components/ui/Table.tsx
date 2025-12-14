import { HTMLAttributes, ReactNode } from "react";
import Card from "./Card";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: ReactNode;
}

export default function Table({ headers, children, className = "" }: TableProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full ${className}`}>
          <thead>
            <tr className="bg-neutral-50">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left uppercase text-xs tracking-wide text-neutral-500 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {children}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TableRow({ children, className = "", ...props }: TableRowProps) {
  return (
    <tr
      className={`hover:bg-[var(--color-neutral-50)] transition-all duration-[var(--transition-base)] hover:shadow-sm ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={`px-6 py-4 text-neutral-700 ${className}`} {...props}>
      {children}
    </td>
  );
}


import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Share, Filter, ChevronDown } from "lucide-react";
import { Contact, Company } from "@/types/contact";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ComprehensiveDataTableProps {
  contacts: Contact[];
  companies: Company[];
}

const ComprehensiveDataTable = ({ contacts, companies }: ComprehensiveDataTableProps) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    startRow: "",
    lastRow: "",
    assignedTo: ""
  });

  const columns = [
    { key: "rowNo", label: "Row No" },
    { key: "name", label: "Name" },
    { key: "company", label: "Company Name" },
    { key: "email", label: "Email Address" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "address", label: "Address" },
    { key: "designation", label: "Designation" },
    { key: "dataCategory", label: "Data Category" },
    { key: "created", label: "Date" },
    { key: "contactAttempt", label: "Contact Attempt" },
    { key: "resultOfEfforts", label: "Result of Efforts" },
    { key: "comments", label: "Comments" },
    { key: "emailBlastDate", label: "Email Blast Date" },
    { key: "bulkEmailFollowup", label: "Bulk Email Follow-up" },
    { key: "bulkEmailFollowupDate", label: "Bulk Email Follow-up Date" },
    { key: "customizedEmailData", label: "Customized Email Data" },
    { key: "followupOverdue", label: "Follow-up Overdue" }
  ];

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        const contactValue = key === "rowNo" 
          ? (contacts.indexOf(contact) + 1).toString()
          : contact[key as keyof Contact]?.toString().toLowerCase() || "";
        
        return contactValue.includes(value.toLowerCase());
      });
    });
  }, [contacts, filters]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const clearFilter = (column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const handleShare = () => {
    toast.success("Data shared successfully");
    setShareDialogOpen(false);
  };

  const getUniqueValues = (key: string) => {
    if (key === "rowNo") {
      return Array.from({ length: contacts.length }, (_, i) => (i + 1).toString());
    }
    return Array.from(new Set(contacts.map(contact => 
      contact[key as keyof Contact]?.toString() || ""
    ).filter(Boolean)));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold">All Company Data</h3>
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="startRow">Start Row</Label>
                <Input
                  id="startRow"
                  placeholder="Enter start row number"
                  value={shareOptions.startRow}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, startRow: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastRow">Last Row</Label>
                <Input
                  id="lastRow"
                  placeholder="Enter last row number"
                  value={shareOptions.lastRow}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, lastRow: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={shareOptions.assignedTo} onValueChange={(value) => setShareOptions(prev => ({ ...prev, assignedTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleShare} className="w-full">
                Share Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="relative whitespace-nowrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm">{column.label}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 sm:w-64 p-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Filter by {column.label}</Label>
                          <Input
                            placeholder={`Search ${column.label.toLowerCase()}...`}
                            value={filters[column.key] || ""}
                            onChange={(e) => handleFilterChange(column.key, e.target.value)}
                            className="h-8"
                          />
                          {filters[column.key] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearFilter(column.key)}
                              className="h-6 text-xs"
                            >
                              Clear filter
                            </Button>
                          )}
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {getUniqueValues(column.key).slice(0, 10).map((value) => (
                              <button
                                key={value}
                                onClick={() => handleFilterChange(column.key, value)}
                                className="block w-full text-left text-xs p-1 hover:bg-gray-100 rounded"
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <TableRow key={contact.id}>
                  <TableCell className="text-xs sm:text-sm">{contacts.indexOf(contact) + 1}</TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{contact.name}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.company}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.email}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.contactNumber || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-32 truncate">{contact.address || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.designation || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.dataCategory || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.created}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.contactAttempt || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-32 truncate">{contact.resultOfEfforts || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-32 truncate">{contact.comments || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.emailBlastDate || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.bulkEmailFollowup || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">{contact.bulkEmailFollowupDate || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-32 truncate">{contact.customizedEmailData || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    {contact.followupOverdue ? (
                      <span className="text-red-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500 text-sm">
                  No data matches the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ComprehensiveDataTable;

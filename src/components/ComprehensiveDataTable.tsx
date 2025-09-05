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
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Company Data</h3>
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
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
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="relative">
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 p-3">
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
                  <TableCell>{contacts.indexOf(contact) + 1}</TableCell>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.contactNumber || "-"}</TableCell>
                  <TableCell>{contact.address || "-"}</TableCell>
                  <TableCell>{contact.designation || "-"}</TableCell>
                  <TableCell>{contact.dataCategory || "-"}</TableCell>
                  <TableCell>{contact.created}</TableCell>
                  <TableCell>{contact.contactAttempt || "-"}</TableCell>
                  <TableCell>{contact.resultOfEfforts || "-"}</TableCell>
                  <TableCell>{contact.comments || "-"}</TableCell>
                  <TableCell>{contact.emailBlastDate || "-"}</TableCell>
                  <TableCell>{contact.bulkEmailFollowup || "-"}</TableCell>
                  <TableCell>{contact.bulkEmailFollowupDate || "-"}</TableCell>
                  <TableCell>{contact.customizedEmailData || "-"}</TableCell>
                  <TableCell>
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
                <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500">
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

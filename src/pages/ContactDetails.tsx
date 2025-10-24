
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { Contact } from "@/types/contact";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
import withAuth from "@/components/withAuth";
import withRole from "@/components/withRole";
import { HOCPresets } from "@/components/HOCComposer";
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ContactDetailsProps {
  user?: any;
  isAuthenticated?: boolean;
}
function ContactDetails({ user, isAuthenticated }: ContactDetailsProps) {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Sample data - in a real app, this would come from an API or context
  const contacts: Contact[] = [
    { 
      id: 1, 
      name: "Contact 1", 
      email: "contact1@example.com", 
      company: "Facebook", 
      status: "New", 
      assignedTo: "John Doe", 
      created: "Jan 2, 2025",
      contactNumber: "+1-555-0101",
      address: "123 Main St, NYC",
      designation: "Marketing Manager",
      dataCategory: "Lead",
      contactAttempt: "Email",
      resultOfEfforts: "Pending",
      comments: "Initial contact made",
      emailBlastDate: "Dec 15, 2024",
      bulkEmailFollowup: "Yes",
      bulkEmailFollowupDate: "Jan 5, 2025",
      customizedEmailData: "Product demo requested",
      followupOverdue: false
    },
    { 
      id: 2, 
      name: "Contact 2", 
      email: "contact2@example.com", 
      company: "Google", 
      status: "Converted", 
      assignedTo: "John Doe", 
      created: "Jan 12, 2025",
      contactNumber: "+1-555-0102",
      address: "456 Tech Ave, SF",
      designation: "Senior Developer",
      dataCategory: "Customer",
      contactAttempt: "Phone",
      resultOfEfforts: "Converted",
      comments: "Successful conversion",
      emailBlastDate: "Dec 20, 2024",
      bulkEmailFollowup: "No",
      customizedEmailData: "Technical integration discussion",
      followupOverdue: false
    },
    { id: 3, name: "Contact 3", email: "contact3@example.com", company: "Apple", status: "Converted", assignedTo: "John Doe", created: "Jan 6, 2025" },
    { id: 4, name: "Contact 4", email: "contact4@example.com", company: "Facebook", status: "New", assignedTo: "John Doe", created: "Jan 6, 2025" },
    { id: 5, name: "Contact 5", email: "contact5@example.com", company: "Google", status: "New", assignedTo: "Alan Johnson", created: "Jan 1, 2025" },
    { id: 6, name: "Contact 6", email: "contact6@example.com", company: "Apple", status: "New", assignedTo: "John Doe", created: "Jan 15, 2025" },
    { id: 7, name: "Contact 7", email: "contact7@example.com", company: "Facebook", status: "New", assignedTo: "Alan Johnson", created: "Jan 3, 2025" },
    { id: 8, name: "Contact 8", email: "contact8@example.com", company: "Google", status: "Contacted", assignedTo: "Jane Smith", created: "Jan 9, 2025" },
    { id: 9, name: "Contact 9", email: "contact9@example.com", company: "Microsoft", status: "Following", assignedTo: "John Doe", created: "Jan 15, 2025" },
    { id: 10, name: "Contact 10", email: "contact10@example.com", company: "Facebook", status: "Contacted", assignedTo: "John Doe", created: "Jan 11, 2025" },
    { id: 11, name: "Contact 11", email: "contact11@example.com", company: "Twitter", status: "New", assignedTo: "Jane Smith", created: "Jan 14, 2025" },
    { id: 12, name: "Contact 12", email: "contact12@example.com", company: "LinkedIn", status: "Following", assignedTo: "Alan Johnson", created: "Jan 7, 2025" },
  ];

  useEffect(() => {
    if (contactId) {
      const foundContact = contacts.find(c => c.id === parseInt(contactId));
      setContact(foundContact || null);
    }
  }, [contactId]);

  const handleBack = () => {
    navigate("/data");
  };

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

  const getContactValue = (key: string) => {
    if (!contact) return "-";
    
    if (key === "rowNo") {
      return "1";
    } else if (key === "followupOverdue") {
      return contact.followupOverdue ? "Yes" : "No";
    } else {
      return contact[key as keyof Contact]?.toString() || "-";
    }
  };

  const filteredData = useMemo(() => {
    if (!contact) return [];
    
    const contactData = columns.map((column) => {
      const value = getContactValue(column.key);
      
      return {
        key: column.key,
        label: column.label,
        value: value
      };
    });

    return contactData.filter(item => {
      const filterValue = filters[item.key];
      if (!filterValue) return true;
      return item.value.toLowerCase().includes(filterValue.toLowerCase());
    });
  }, [contact, filters, columns]);

  if (!contact) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Contact Not Found</h1>
          </div>
          <p className="text-gray-600">The requested contact could not be found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contact.name}</h1>
            <p className="text-gray-600 mt-1">Contact Details</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className="relative min-w-[120px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{column.label}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-6 w-6 p-0 hover:bg-gray-100 ${filters[column.key] ? 'text-blue-600' : 'text-gray-400'}`}
                            >
                              <Filter className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-64 p-3 bg-white border shadow-lg z-50">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Filter {column.label}</Label>
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
                                  className="h-6 text-xs w-full"
                                >
                                  Clear filter
                                </Button>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  <TableRow>
                    {columns.map((column) => {
                      const value = getContactValue(column.key);
                      const isVisible = filteredData.some(item => item.key === column.key);
                      
                      return (
                        <TableCell key={column.key} className={`text-sm ${!isVisible ? 'opacity-50' : ''}`}>
                          {column.key === "followupOverdue" ? (
                            contact.followupOverdue ? (
                              <span className="text-red-600 font-medium">Yes</span>
                            ) : (
                              <span className="text-green-600">No</span>
                            )
                          ) : (
                            <span className="truncate block max-w-[150px]" title={value}>
                              {value}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
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
      </div>
    </Layout>
  );
}
// Export with authentication and role protection
// Export with comprehensive HOC protection
export default HOCPresets.managerPage(ContactDetails);

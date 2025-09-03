import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { toast } from "sonner";
import CompanyCard from "@/components/CompanyCard";
import NewCompanyDialog from "@/components/NewCompanyDialog";
import CompanyDetails from "@/components/CompanyDetails";
import ComprehensiveDataTable from "@/components/ComprehensiveDataTable";
import { Contact, Company, ContactStatus } from "@/types/contact";

export default function DataManagement() {
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAllData, setShowAllData] = useState(false);
  
  // Sample data for companies and contacts with extended fields
  const [contacts, setContacts] = useState<Contact[]>([
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
  ]);
  
  // ... keep existing code (companies state and all existing functions)
  const [companies, setCompanies] = useState<Company[]>([
    { id: 1, name: "Facebook", logoUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=169" },
    { id: 2, name: "Google", logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=169" },
    { id: 3, name: "Apple", logoUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300&h=169" },
    { id: 4, name: "Microsoft", logoUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=300&h=169" },
    { id: 5, name: "Twitter", logoUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=169" },
    { id: 6, name: "LinkedIn", logoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=169" },
  ]);

  const handleStatusChange = (contactId: number, newStatus: ContactStatus) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: newStatus }
          : contact
      )
    );
    toast.success(`Contact status updated to ${newStatus}`);
  };

  const handleAddCompany = (companyName: string, logoUrl: string) => {
    if (!companyName) return;
    
    const newId = Math.max(0, ...companies.map(c => c.id)) + 1;
    const newCompany: Company = {
      id: newId,
      name: companyName,
      logoUrl: logoUrl || undefined
    };
    
    setCompanies([...companies, newCompany]);
    toast.success(`Company "${companyName}" has been added successfully`);
  };

  const companyContacts = useMemo(() => {
    if (!selectedCompany) return [];
    console.log("Filtering contacts for company:", selectedCompany.name);
    const filtered = contacts.filter(contact => contact.company === selectedCompany.name);
    console.log("Found contacts:", filtered.length);
    return filtered;
  }, [selectedCompany, contacts]);

  const getContactCountForCompany = (companyName: string) => {
    return contacts.filter(contact => contact.company === companyName).length;
  };

  // ... keep existing code (export and import functions)
  const handleExport = () => {
    const header = ["id", "name", "email", "company", "status", "assignedTo", "created"];
    
    const dataToExport = selectedCompany 
      ? contacts.filter(contact => contact.company === selectedCompany.name)
      : contacts;
    
    const rows = dataToExport.map(contact => [
      contact.id, 
      contact.name, 
      contact.email,
      contact.company,
      contact.status,
      contact.assignedTo,
      contact.created
    ]);
    
    const csvContent = [
      header.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contacts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data exported successfully");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split("\n");
        
        const headers = lines[0].split(",");
        
        const importedContacts: Contact[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(",");
          const contact: any = {};
          
          headers.forEach((header, index) => {
            if (header === "id") {
              contact[header] = parseInt(values[index]);
            } else {
              contact[header] = values[index];
            }
          });
          
          if (
            contact.id && 
            contact.name && 
            contact.email && 
            contact.company && 
            ["New", "Converted", "Contacted", "Following"].includes(contact.status) && 
            contact.assignedTo && 
            contact.created
          ) {
            importedContacts.push(contact as Contact);
          }
        }
        
        if (importedContacts.length > 0) {
          const maxId = Math.max(...contacts.map(c => c.id), 0);
          
          const processedContacts = importedContacts.map((contact, index) => ({
            ...contact,
            id: maxId + index + 1
          }));
          
          setContacts([...contacts, ...processedContacts]);

          const existingCompanyNames = new Set(companies.map(c => c.name));
          const newCompanyNames = new Set(processedContacts
            .map(c => c.company)
            .filter(name => !existingCompanyNames.has(name))
          );

          if (newCompanyNames.size > 0) {
            const lastCompanyId = Math.max(...companies.map(c => c.id), 0);
            const newCompanies = Array.from(newCompanyNames).map((name, index) => ({
              id: lastCompanyId + index + 1,
              name
            }));
            
            setCompanies([...companies, ...newCompanies]);
          }
          
          toast.success(`Imported ${processedContacts.length} contacts successfully`);
        } else {
          toast.error("No valid contacts found in the imported file");
        }
      } catch (error) {
        console.error("Error importing CSV:", error);
        toast.error("Failed to import contacts. Please check your CSV format.");
      }
    };
    
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data Management</h1>
            <p className="text-gray-600 mt-1">Manage your companies and contacts.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="file"
                id="importFile"
                className="hidden"
                accept=".csv"
                onChange={handleImport}
              />
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => document.getElementById("importFile")?.click()}>
                Import
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleExport}
            >
              Export
            </Button>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowCompanyDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Show All Data table view */}
        {showAllData && (
          <div className="mb-6">
            <div className="mb-4 flex items-center">
              <Button variant="ghost" onClick={() => setShowAllData(false)} className="mr-4">
                ← Back
              </Button>
              <h2 className="text-2xl font-bold">All Data</h2>
            </div>
            <ComprehensiveDataTable contacts={contacts} companies={companies} />
          </div>
        )}

        {/* Show company grid or comprehensive table when not viewing all data and no company selected */}
        {!showAllData && !selectedCompany && (
          <>
           
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {/* All Data Box */}
              <div
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowAllData(true)}
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">All Data</h3>
                    <p className="text-sm text-gray-500">{contacts.length} total contacts</p>
                  </div>
                </div>
              </div>

              {/* Company Cards */}
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  name={company.name}
                  logoUrl={company.logoUrl}
                  contactCount={getContactCountForCompany(company.name)}
                  onClick={() => {
                    console.log("Company selected:", company.name);
                    setSelectedCompany(company);
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Company Details View */}
        {selectedCompany && !showAllData && (
          <CompanyDetails
            company={selectedCompany}
            contacts={companyContacts}
            onBackClick={() => setSelectedCompany(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
      
      {/* New Company Dialog */}
      <NewCompanyDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onAddCompany={handleAddCompany}
      />
    </Layout>
  );
}


import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableHead, 
  TableHeader, TableRow, TableCell 
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { Contact, Company, ContactStatus } from "@/types/contact";
import ContactRow from "./ContactRow";

interface CompanyDetailsProps {
  company: Company;
  contacts: Contact[];
  onBackClick: () => void;
  onStatusChange: (contactId: number, newStatus: ContactStatus) => void;
}

export default function CompanyDetails({ 
  company, 
  contacts, 
  onBackClick, 
  onStatusChange 
}: CompanyDetailsProps) {
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={onBackClick} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center">
          {company.logoUrl && (
            <img 
              src={company.logoUrl} 
              alt={company.name}
              className="w-12 h-12 rounded-lg mr-4 object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <p className="text-gray-600">{contacts.length} contacts</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Contacts</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  index={index}
                  onStatusChange={onStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No contacts found for this company.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

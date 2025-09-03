
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Contact, ContactStatus } from "@/types/contact";

interface ContactRowProps {
  contact: Contact;
  index: number;
  onStatusChange: (contactId: number, newStatus: ContactStatus) => void;
}

export default function ContactRow({ contact, index, onStatusChange }: ContactRowProps) {
  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Converted": return "bg-green-100 text-green-800";
      case "Contacted": return "bg-yellow-100 text-yellow-800";
      case "Following": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions: ContactStatus[] = ["New", "Converted", "Contacted", "Following"];

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="font-medium">
        <Link 
          to={`/contact/${contact.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {contact.name}
        </Link>
      </TableCell>
      <TableCell>{contact.email}</TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0">
              <Badge className={`${getStatusColor(contact.status)} flex items-center gap-1`}>
                {contact.status}
                <ChevronDown className="h-3 w-3" />
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="start">
            <div className="space-y-1">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-8"
                  onClick={() => onStatusChange(contact.id, status)}
                >
                  <Badge className={`${getStatusColor(status)} text-xs`}>
                    {status}
                  </Badge>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>{contact.assignedTo}</TableCell>
      <TableCell>{contact.created}</TableCell>
    </TableRow>
  );
}

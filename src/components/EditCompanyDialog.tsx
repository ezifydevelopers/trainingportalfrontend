import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: {
    id: number;
    name: string;
    logo?: string;
  } | null;
  onUpdateCompany: (companyId: number, companyName: string, logoFile: File | null) => void;
}

const EditCompanyDialog = ({ open, onOpenChange, company, onUpdateCompany }: EditCompanyDialogProps) => {
  const [companyName, setCompanyName] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState("");

  // Update form when company changes
  React.useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setLogoFile(null);
      setLogoPreview(company.logo || "");
    }
  }, [company]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Logo file selected:', file);
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      console.log('Logo preview URL created');
    } else {
      setLogoFile(null);
      setLogoPreview(company?.logo || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EditCompanyDialog submit:', { companyName, logoFile, company });
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!company) {
      toast.error("No company selected");
      return;
    }
    onUpdateCompany(company.id, companyName, logoFile);
    setCompanyName("");
    setLogoFile(null);
    setLogoPreview("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCompanyName("");
    setLogoFile(null);
    setLogoPreview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information and logo. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo-upload" className="text-right">
                Upload Logo
              </Label>
              <div className="col-span-3">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="h-16 w-16 object-contain rounded border" 
                    />
                    <span className="text-sm text-muted-foreground">
                      {logoFile ? "New logo selected" : "Current logo"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;

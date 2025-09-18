import React, { memo, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  X, 
  Upload, 
  Building2, 
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Company } from '@/shared/types/common.types';
import { getImageUrl } from '@/shared/utils/imageUtils';

interface CompanyEditDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: number;
    name: string;
    description?: string;
    logo?: File;
  }) => Promise<void>;
  isLoading?: boolean;
}

const CompanyEditDialog = memo<CompanyEditDialogProps>(({
  company,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Initialize form with company data
  useEffect(() => {
    if (company) {
      setName(company.name);
      setDescription(company.description || '');
      setLogoFile(null);
      setLogoPreview(company.logo ? getImageUrl(company.logo) : '');
    }
  }, [company]);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company || !name.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    try {
      await onSubmit({
        id: company.id,
        name: name.trim(),
        description: description.trim() || undefined,
        logo: logoFile || undefined
      });
      
      // Reset form
      setName('');
      setDescription('');
      setLogoFile(null);
      setLogoPreview('');
    } catch (error) {
      console.error('Error updating company:', error);
    }
  }, [company, name, description, logoFile, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset form
    setName('');
    setDescription('');
    setLogoFile(null);
    setLogoPreview('');
  }, [onClose]);

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Company</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Company Logo</Label>
            
            {/* Current Logo Preview */}
            {logoPreview && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Current Logo</p>
                  <p className="text-xs text-gray-500">
                    {logoFile ? 'New logo selected' : 'Existing logo'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveLogo}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition group bg-gray-50 hover:bg-blue-50"
              >
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF (max 5MB)
                </span>
              </label>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Company Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter company name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter company description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Company Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Company Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>ID: {company.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Logo: {company.logo ? 'Present' : 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CompanyEditDialog.displayName = 'CompanyEditDialog';

export default CompanyEditDialog;

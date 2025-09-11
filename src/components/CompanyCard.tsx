
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Trash2, Edit } from "lucide-react";

interface CompanyCardProps {
  id: number;
  name: string;
  logoUrl?: string;
  contactCount: number;
  onClick: () => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
}

const CompanyCard = ({
  id,
  name,
  logoUrl,
  contactCount,
  onClick,
  onDelete,
  onEdit,
  showDeleteButton = false,
  showEditButton = false,
}: CompanyCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };


  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 relative group"
      onClick={onClick}
    >
      {showEditButton && onEdit && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {showDeleteButton && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Image failed to load - handled silently
              }}
              onLoad={() => {
                // Image loaded successfully - handled silently
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
      </AspectRatio>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name || 'Unknown Company'}</h3>
        {/* <p className="text-sm text-muted-foreground">
          {contactCount} {contactCount === 1 ? "contact" : "contacts"}
        </p> */}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;

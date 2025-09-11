import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Award, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  completedAt: string;
  pdfPath: string | null;
  isActive: boolean;
  company: {
    id: number;
    name: string;
  };
}

interface CertificateCardProps {
  certificate: Certificate;
  onDownload: (certificateId: number) => void;
}

export default function CertificateCard({ certificate, onDownload }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    onDownload(certificate.id);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Certificate
          </CardTitle>
          <Badge variant={certificate.isActive ? "default" : "secondary"}>
            {certificate.isActive ? "Active" : "Revoked"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span className="font-mono text-xs">{certificate.certificateNumber}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Completed: {formatDate(certificate.completedAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Issued: {formatDate(certificate.issuedAt)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground">
            Company: {certificate.company.name}
          </p>
        </div>

        <Button 
          onClick={handleDownload}
          disabled={!certificate.pdfPath || !certificate.isActive}
          className="w-full"
          variant={certificate.pdfPath && certificate.isActive ? "default" : "secondary"}
        >
          <Download className="w-4 h-4 mr-2" />
          {certificate.pdfPath && certificate.isActive ? "Download PDF" : "PDF Not Available"}
        </Button>
      </CardContent>
    </Card>
  );
}

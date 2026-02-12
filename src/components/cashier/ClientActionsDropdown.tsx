import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  FileText,
  Package,
  Eye,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  phone: string;
  debt: number;
  cageots: number;
}

interface ClientActionsDropdownProps {
  client: Client;
  onPayment?: (client: Client) => void;
  onInvoice?: (client: Client) => void;
  onCageots?: (client: Client) => void;
  onDetails?: (client: Client) => void;
  onWhatsApp?: (client: Client) => void;
}

export function ClientActionsDropdown({
  client,
  onPayment,
  onInvoice,
  onCageots,
  onDetails,
  onWhatsApp,
}: ClientActionsDropdownProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handlePayment = () => {
    onPayment?.(client);
    setOpen(false);
  };

  const handleInvoice = () => {
    onInvoice?.(client);
    setOpen(false);
  };

  const handleCageots = () => {
    onCageots?.(client);
    setOpen(false);
  };

  const handleDetails = () => {
    onDetails?.(client);
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${client.name},\n\nVotre situation chez SODIPAS:\n- Dette: ${client.debt > 0 ? client.debt.toLocaleString() + " F" : "Aucune"}\n- Cageots: ${client.cageots}\n\nMerci de votre confiance.`
    );
    window.open(`https://wa.me/${client.phone}?text=${message}`, "_blank");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#1F3A5F] hover:text-[#1F3A5F] hover:bg-[#1F3A5F]/10">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePayment} className="flex items-center gap-2 cursor-pointer">
          <DollarSign className="h-4 w-4 text-[#2E7D32]" />
          <span>Enregistrer paiement</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInvoice} className="flex items-center gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-[#1F3A5F]" />
          <span>Créer facture</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCageots} className="flex items-center gap-2 cursor-pointer">
          <Package className="h-4 w-4 text-[#F9C74F]" />
          <span>Gérer cageots</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDetails} className="flex items-center gap-2 cursor-pointer">
          <Eye className="h-4 w-4 text-[#6B7280]" />
          <span>Voir détails</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp} className="flex items-center gap-2 cursor-pointer">
          <MessageSquare className="h-4 w-4 text-[#25D366]" />
          <span>Envoyer WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

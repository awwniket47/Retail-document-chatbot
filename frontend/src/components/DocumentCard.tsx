import { FileText, Image, Trash2, RefreshCw } from "lucide-react";

export interface DocumentInfo {
  id: string;
  filename: string;
  type: "pdf" | "docx" | "image";
  uploadDate: string;
  status: "processing" | "ready" | "error";
  chunks: number;
}

const statusConfig = {
  processing: { label: "Processing", className: "text-warning bg-warning/10" },
  ready: { label: "Ready", className: "text-success bg-success/10" },
  error: { label: "Error", className: "text-destructive bg-destructive/10" },
};

const DocumentCard = ({
  doc,
  onDelete,
  onReprocess,
}: {
  doc: DocumentInfo;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
}) => {
  const status = statusConfig[doc.status];
  const Icon = doc.type === "image" ? Image : FileText;

  return (
    <div className="glass-card p-5 flex items-start gap-4 group hover:border-primary/30 transition-colors">
      <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{doc.filename}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {doc.uploadDate} • {doc.chunks} chunks
        </p>
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onReprocess(doc.id)}
          className="p-2 text-muted-foreground hover:text-info rounded-lg hover:bg-muted transition-colors"
          title="Reprocess"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;

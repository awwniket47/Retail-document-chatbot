import { useState } from "react";
import Layout from "@/components/Layout";
import DocumentCard, { DocumentInfo } from "@/components/DocumentCard";
import { Search } from "lucide-react";

const mockDocs: DocumentInfo[] = [
  { id: "1", filename: "Q4_Retail_Report.pdf", type: "pdf", uploadDate: "Feb 10, 2026", status: "ready", chunks: 42 },
  { id: "2", filename: "Product_Catalog_2026.pdf", type: "pdf", uploadDate: "Feb 9, 2026", status: "ready", chunks: 128 },
  { id: "3", filename: "Store_Layout_Guide.docx", type: "docx", uploadDate: "Feb 8, 2026", status: "processing", chunks: 0 },
  { id: "4", filename: "shelf_display.png", type: "image", uploadDate: "Feb 7, 2026", status: "ready", chunks: 3 },
];

const Documents = () => {
  const [docs, setDocs] = useState(mockDocs);
  const [search, setSearch] = useState("");

  const filtered = docs.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleReprocess = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "processing" as const, chunks: 0 } : d))
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {docs.length} document{docs.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={handleDelete}
              onReprocess={handleReprocess}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No documents found
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Documents;

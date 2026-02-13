import { useCallback, useState } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
}

const UploadArea = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const uploaded: UploadedFile[] = Array.from(newFiles).map((file) => ({
      file,
      id: crypto.randomUUID(),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...uploaded]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleProcess = () => {
    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" } : f))
    );
    // Simulate processing
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (f.status === "uploading" ? { ...f, status: "done" } : f))
      );
    }, 2000);
  };

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 glow-primary"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <motion.div
          animate={{ y: isDragging ? -4 : 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PDF, DOCX, PNG, JPG • Max 20MB per file
            </p>
          </div>
        </motion.div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </h3>
              {files.some((f) => f.status === "pending") && (
                <button
                  onClick={handleProcess}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Process All
                </button>
              )}
            </div>

            {files.map((f) => {
              const Icon = getIcon(f.file.type);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {f.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {f.status === "uploading" && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {f.status === "done" && (
                      <span className="text-xs font-medium text-success px-2 py-1 bg-success/10 rounded-full">
                        Processed
                      </span>
                    )}
                    {f.status === "pending" && (
                      <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">
                        Pending
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(f.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadArea;

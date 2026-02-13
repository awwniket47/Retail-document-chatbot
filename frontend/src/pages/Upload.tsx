import Layout from "@/components/Layout";
import UploadArea from "@/components/UploadArea";

const Upload = () => {
  return (
    <Layout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add retail documents and images for AI-powered analysis
          </p>
        </div>
        <UploadArea />
      </div>
    </Layout>
  );
};

export default Upload;

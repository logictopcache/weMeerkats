import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiFileText,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { pdfParserService } from "../../services/api/pdfParserService";

const ResumeUpload = ({ onDataExtracted, onLoadingChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [showResumeList, setShowResumeList] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setExtractedData(null); // Reset previous data
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file first");
      return;
    }

    try {
      setIsUploading(true);
      setIsAnalyzing(true);
      onLoadingChange?.(true);

      const response = await pdfParserService.uploadResume(selectedFile);

      if (response.analysis?.extractedData) {
        setExtractedData(response.analysis.extractedData);
        onDataExtracted?.(response.analysis.extractedData);
        toast.success(
          "Resume analyzed successfully! Profile fields have been auto-filled."
        );
      } else {
        toast.error("Failed to extract data from resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload and analyze resume");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      onLoadingChange?.(false);
    }
  };

  const handleReanalyze = async (filename) => {
    try {
      setIsAnalyzing(true);
      onLoadingChange?.(true);

      const response = await pdfParserService.analyzeResume(filename);

      if (response.analysis?.extractedData) {
        setExtractedData(response.analysis.extractedData);
        onDataExtracted?.(response.analysis.extractedData);
        toast.success("Resume re-analyzed successfully!");
      }
    } catch (error) {
      console.error("Re-analyze error:", error);
      toast.error(error.message || "Failed to re-analyze resume");
    } finally {
      setIsAnalyzing(false);
      onLoadingChange?.(false);
    }
  };

  const handleDeleteResume = async (filename) => {
    try {
      await pdfParserService.deleteResume(filename);
      setUploadedResumes((prev) =>
        prev.filter((resume) => resume.filename !== filename)
      );
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete resume");
    }
  };

  const loadUploadedResumes = async () => {
    try {
      const response = await pdfParserService.getResumes();
      setUploadedResumes(response.resumes || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load uploaded resumes");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-primary-color flex items-center">
          <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
            📄
          </span>
          Resume Upload & Auto-Fill
        </h2>
        <button
          onClick={() => {
            setShowResumeList(!showResumeList);
            if (!showResumeList) {
              loadUploadedResumes();
            }
          }}
          className="text-sm text-primary-color hover:text-primary-color/80 transition-colors"
        >
          {showResumeList ? "Hide" : "Show"} Previous Uploads
        </button>
      </div>

      {/* Previous Uploads Section */}
      {showResumeList && uploadedResumes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 bg-white/[0.03] rounded-lg border border-white/5"
        >
          <h3 className="text-lg font-medium text-white mb-3">
            Previous Uploads
          </h3>
          <div className="space-y-2">
            {uploadedResumes.map((resume) => (
              <div
                key={resume.filename}
                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5"
              >
                <div className="flex items-center space-x-3">
                  <FiFileText className="text-primary-color" />
                  <div>
                    <p className="text-white font-medium">{resume.filename}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(resume.size)} •{" "}
                      {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReanalyze(resume.filename)}
                    disabled={isAnalyzing}
                    className="p-2 text-primary-color hover:bg-primary-color/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Re-analyze"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteResume(resume.filename)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Section */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary-color/50 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
            disabled={isUploading || isAnalyzing}
          />
          <label htmlFor="resume-upload" className="cursor-pointer block">
            <FiUpload className="mx-auto text-4xl text-primary-color mb-4" />
            <p className="text-white font-medium mb-2">
              {selectedFile
                ? selectedFile.name
                : "Click to upload your resume (PDF)"}
            </p>
            <p className="text-sm text-gray-400">
              Upload your resume and we'll automatically fill your profile
              fields
            </p>
            {selectedFile && (
              <p className="text-xs text-primary-color mt-2">
                Selected: {selectedFile.name} (
                {formatFileSize(selectedFile.size)})
              </p>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
              <FiFileText className="text-primary-color" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <motion.button
            onClick={handleUpload}
            disabled={isUploading || isAnalyzing}
            className="w-full py-3 px-6 bg-primary-color text-white font-medium rounded-lg hover:bg-primary-color/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUploading || isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {isUploading ? "Uploading..." : "Analyzing with AI..."}
                </span>
              </>
            ) : (
              <>
                <FiUpload className="w-5 h-5" />
                <span>Upload & Analyze Resume</span>
              </>
            )}
          </motion.button>
        )}

        {/* Success Message */}
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-green-400">
              <FiCheck className="w-5 h-5" />
              <span className="font-medium">
                Profile fields auto-filled successfully!
              </span>
            </div>
            <p className="text-sm text-green-300 mt-1">
              Review and edit the extracted information below
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResumeUpload;

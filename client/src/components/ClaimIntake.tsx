import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
}

interface ClaimAssessment {
  extractedFields: {
    lienholder?: string;
    payoffAmount?: string;
    settlementAmount?: string;
    vin?: string;
    dates?: string[];
    policyNumber?: string;
    claimantName?: string;
  };
  missingItems: string[];
  completenessScore: number;
  nextSteps: string[];
  followUpEmail?: string;
  processingSteps: string[];
}

const ClaimIntake = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setError('Only PDF files are allowed');
      setTimeout(() => setError(''), 3000);
    }

    const newFiles: UploadedFile[] = pdfFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setError('Only PDF files are allowed');
      setTimeout(() => setError(''), 3000);
    }

    const newFiles: UploadedFile[] = pdfFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processDocuments = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setIsProcessing(true);
    setAssessment(null);
    setProcessingSteps([]);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_JAC_SERVER_URL || 'http://localhost:8000';
      
      // Step 1: Convert files to base64
      const sessionId = `claim_${Date.now()}`;
      
      setCurrentStep('Preparing documents...');
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'uploading' as const, progress: 20 }))
      );

      const filesBase64 = await Promise.all(
        uploadedFiles.map(async (uploadedFile) => {
          return new Promise<{filename: string, content_base64: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1]; // Remove data:application/pdf;base64, prefix
              resolve({
                filename: uploadedFile.file.name,
                content_base64: base64,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(uploadedFile.file);
          });
        })
      );

      // Step 2: Upload files to S3 via walker
      setCurrentStep('Uploading documents to secure storage...');
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'uploading' as const, progress: 40 }))
      );

      const uploadResponse = await fetch(`${API_URL}/walker/upload_claim_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          files: filesBase64,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);

      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'processing' as const, progress: 50 }))
      );

      // Step 3: Process documents with walker
      setCurrentStep('Processing documents with AI...');
      setProcessingSteps(['Documents uploaded to S3', 'Starting AI analysis...']);

      const processResponse = await fetch(`${API_URL}/walker/process_claim_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed');
      }

      const processData = await processResponse.json();
      console.log('Process response:', processData);

      if (processData.reports && processData.reports.length > 0) {
        const result = processData.reports[0];
        
        if (result.assessment) {
          setUploadedFiles(prev => 
            prev.map(f => ({ ...f, status: 'complete' as const, progress: 100 }))
          );
          
          setAssessment(result.assessment);
          
          // Add processing steps if available
          if (result.assessment.processingSteps) {
            setProcessingSteps(result.assessment.processingSteps);
          }
        } else {
          throw new Error('No assessment returned');
        }
      } else {
        throw new Error('Invalid response format');
      }

      setIsProcessing(false);

    } catch (error) {
      console.error('Error processing documents:', error);
      setError('Failed to process documents. Please try again.');
      setIsProcessing(false);
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'error' as const }))
      );
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">GAP Insurance Claim Intake</CardTitle>
          <CardDescription>
            Upload your GAP contract, insurance settlement letter, and other relevant documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Drag and drop PDF files here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            <Button variant="outline" onClick={(e) => e.stopPropagation()}>
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold mb-2">Uploaded Documents:</h3>
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                        <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                  {uploadedFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Process Button */}
          {uploadedFiles.length > 0 && !isProcessing && !assessment && (
            <Button
              onClick={processDocuments}
              className="w-full mt-6"
              size="lg"
            >
              Process Claim Documents
            </Button>
          )}

          {/* Processing Steps */}
          {isProcessing && (
            <Card className="mt-6 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Documents...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processingSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                  {currentStep && (
                    <div className="flex items-start space-x-2">
                      <Loader2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
                      <p className="text-sm font-medium">{currentStep}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Assessment Results */}
      {assessment && (
        <div className="space-y-6">
          {/* Completeness Score */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Intake Assessment</CardTitle>
              <CardDescription>
                Completeness Score: {assessment.completenessScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={assessment.completenessScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Extracted Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Extracted Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(assessment.extractedFields).map(([key, value]) => (
                  value && (
                    <div key={key} className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm font-semibold text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-base">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing Items */}
          {assessment.missingItems.length > 0 && (
            <Card className="border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Missing Documents/Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assessment.missingItems.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {assessment.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Follow-up Email */}
          {assessment.followUpEmail && (
            <Card>
              <CardHeader>
                <CardTitle>Template Follow-up Email</CardTitle>
                <CardDescription>
                  Use this template to request missing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {assessment.followUpEmail}
                </div>
                <Button
                  className="mt-4"
                  onClick={() => {
                    navigator.clipboard.writeText(assessment.followUpEmail || '');
                    // You could add a toast notification here
                  }}
                >
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Start New Assessment */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setUploadedFiles([]);
              setAssessment(null);
              setProcessingSteps([]);
              setCurrentStep('');
              setError('');
            }}
          >
            Start New Assessment
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClaimIntake;

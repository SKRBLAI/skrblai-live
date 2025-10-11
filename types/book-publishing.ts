// Book Publishing Types - April 2025

export interface BookPublishingState {
  prompt: string;
  uploadedFile: File | null;
  uploadedFileName: string;
  uploadedFileUrl: string;
  isSubmitting: boolean;
  response: BookPublishingResponse | null;
}

export interface BookPublishingResponse {
  steps: Array<{
    title: string;
    description: string;
    timeline: string;
  }>;
  recommendations: Array<string>;
  nextSteps: Array<string>;
  estimatedCompletion: string;
}

export type FileUploadStatus = {
  uploading?: boolean;
  progress: number;
  error?: string;
  success: boolean;
};

import jsPDF from 'jspdf';

interface AnalysisData {
  playerName?: string;
  sport: string;
  analysisDate: string;
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  technicalFeedback: string[];
  quickFixes: string[];
  nextSteps: string[];
  personalizedMessage?: string;
  ageGroup?: string;
}

export const generateSkillSmithPDF = async (analysisData: AnalysisData): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Set up colors matching SkillSmith orange/red theme
  const primaryColor: [number, number, number] = [249, 115, 22]; // orange-500
  const secondaryColor: [number, number, number] = [239, 68, 68]; // red-500
  const textColor: [number, number, number] = [31, 41, 55]; // gray-800
  const lightGray: [number, number, number] = [156, 163, 175]; // gray-400
  
  let yPosition = 20;
  const pageWidth = 210; // A4 width in mm
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  // Header with SkillSmith branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // SkillSmith logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SkillSmith', margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('AI Sports Performance Analysis', margin + 60, 20);
  
  yPosition = 50;
  
  // Title and player info
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Analysis Report', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  if (analysisData.playerName) {
    doc.text(`Athlete: ${analysisData.playerName}`, margin, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Sport: ${analysisData.sport}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Analysis Date: ${analysisData.analysisDate}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Age Group: ${analysisData.ageGroup || 'Not specified'}`, margin, yPosition);
  
  yPosition += 20;
  
  // Overall Score Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Overall Performance Score', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text(`${analysisData.overallScore}/100`, margin, yPosition);
  
  // Score description
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  let scoreDescription = '';
  if (analysisData.overallScore >= 90) scoreDescription = 'Elite Performance';
  else if (analysisData.overallScore >= 80) scoreDescription = 'Advanced Skill Level';
  else if (analysisData.overallScore >= 70) scoreDescription = 'Good Foundation';
  else if (analysisData.overallScore >= 60) scoreDescription = 'Developing Skills';
  else scoreDescription = 'Beginner Level';
  
  doc.text(scoreDescription, margin, yPosition);
  
  yPosition += 25;
  
  // Helper function to add section
  const addSection = (title: string, items: string[], icon: string = '•') => {
    if (items.length === 0) return;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(title, margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    
    items.forEach((item, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      const lines = doc.splitTextToSize(`${icon} ${item}`, contentWidth - 10);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });
    
    yPosition += 10;
  };
  
  // Add sections
  addSection('🔥 Your Strengths', analysisData.strengths);
  addSection('🎯 Areas for Improvement', analysisData.improvementAreas);
  addSection('⚙️ Technical Feedback', analysisData.technicalFeedback);
  addSection('⚡ Quick Fixes', analysisData.quickFixes, '✓');
  addSection('🚀 Next Steps', analysisData.nextSteps, '→');
  
  // Personalized message
  if (analysisData.personalizedMessage) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFillColor(255, 248, 234); // orange-50
    doc.rect(margin, yPosition - 5, contentWidth, 30, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Personal Message from SkillSmith', margin + 5, yPosition + 5);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'italic');
    
    const messageLines = doc.splitTextToSize(analysisData.personalizedMessage, contentWidth - 10);
    messageLines.forEach((line: string) => {
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text(`Generated by SkillSmith AI • Page ${i} of ${pageCount} • ${analysisData.analysisDate}`, 
             margin, 285);
    doc.text('Continue your journey at skrblai.io/sports', margin, 290);
  }
  
  return doc.output('blob');
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

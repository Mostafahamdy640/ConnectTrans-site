import JSZip from 'jszip';

export async function exportProjectToZip() {
  try {
    // Directly download the complete pre-built archive if available
    const link = document.createElement('a');
    link.href = '/ConnectTrans-SourceCode.zip';
    link.download = 'ConnectTrans-SourceCode.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to trigger download:', error);
    return false;
  }
}

export const uploadResume = async (file: File, mode: string) => {
  console.log('Uploading resume...', { fileName: file.name, mode });  // Debug log
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  
  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    console.log('Response status:', response.status);  // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);  // Debug log
      throw new Error(
        errorData?.error || 
        `Server error (${response.status}): Please ensure the backend server is running on port 5000`
      );
    }

    const data = await response.json();
    console.log('Received data:', data);  // Debug log
    return data;
  } catch (error) {
    console.error('Upload error:', error);  // Debug log
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check if the backend server is running.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not connect to the server. Please ensure the backend is running on http://localhost:5000');
      }
    }
    throw error;
  }
};
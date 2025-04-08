export const uploadResume = async (file: File, mode: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  
  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
      // Add timeout and credentials
      credentials: 'same-origin',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || 
        `Server error (${response.status}): Please ensure the backend server is running on port 5000`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if the backend server is running.');
    } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please ensure the backend is running on http://localhost:5000');
    }
    console.error('Error details:', error);
    throw error;
  }
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DesignIdeasRequest {
  prompt: string;
}

export interface DesignIdeasResponse {
  designIdeas: string[];
}

export interface DesignImageRequest {
  prompt: string;
  category: string;
  clothingType: string;
  sleeveLength: string;
  clothingColor: string;
  printStyle: string;
  style: string;
  printLocation: string;
  includeLogo?: boolean;
}

export interface DesignImageResponse {
  imageUrl: string;
}

export interface AvatarViewsRequest {
  userPhoto: string;
  designImage: string;
  clothingType: string;
}

export interface AvatarViewsResponse {
  avatarViews: string[];
}

export class AIService {
  static async generateDesignIdeas(request: DesignIdeasRequest): Promise<DesignIdeasResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-design-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design ideas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating design ideas:', error);
      throw error;
    }
  }

  static async generateDesignImage(request: DesignImageRequest): Promise<DesignImageResponse> {
    try {
      console.log('Generating design image with request:', request);
      console.log('API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/ai/generate-design-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to generate design image: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Generated image result:', result);
      return result;
    } catch (error) {
      console.error('Error generating design image:', error);
      throw error;
    }
  }

  static async generateAvatarViews(request: AvatarViewsRequest): Promise<AvatarViewsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-avatar-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar views');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating avatar views:', error);
      throw error;
    }
  }
}

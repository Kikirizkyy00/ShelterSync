import { CalendarProvider, CalendarEvent } from './types';

/**
 * Service to manage interactions with multiple calendar providers.
 * Enhances the core functionality established in src/lib/shelby.ts.
 */
class CalendarService {
  /**
   * Sends an event to the appropriate API endpoint based on the selected provider.
   * @param provider - The chosen calendar service ('google' | 'outlook' | 'apple').
   * @param event - Object containing task details (title, description, times).
   */
  async addEvent(provider: CalendarProvider, event: CalendarEvent): Promise<any> {
    try {
      // Dynamically determine the endpoint based on the provider folder structure
      // Example: /api/calendar/google/add-event
      const endpoint = `/api/calendar/${provider}/add-event`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add event to ${provider}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`CalendarService Error (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Checks if the user has granted authentication permissions for a specific provider.
   * Useful for verifying connection status before attempting to sync tasks.
   */
  async checkAuthStatus(provider: CalendarProvider): Promise<boolean> {
    try {
      const response = await fetch(`/api/auth/${provider}/status`);
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return !!data.isAuthenticated;
    } catch (error) {
      console.error(`Auth Status Check Error (${provider}):`, error);
      return false;
    }
  }
}

export const calendarService = new CalendarService();
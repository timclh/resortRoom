import { useEffect } from 'react';

const BASE_TITLE = 'Beach Resort';

/**
 * Custom hook to set the document title dynamically
 * @param {string} title - The page-specific title (will be appended to base title)
 * @param {string} description - Optional meta description for the page
 */
export const usePageTitle = (title, description) => {
  useEffect(() => {
    // Set the document title
    const previousTitle = document.title;
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    // Update meta description if provided
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      const previousDescription = metaDescription?.getAttribute('content');

      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }

      // Cleanup: restore previous description
      return () => {
        document.title = previousTitle;
        if (metaDescription && previousDescription) {
          metaDescription.setAttribute('content', previousDescription);
        }
      };
    }

    // Cleanup: restore previous title
    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
};

export default usePageTitle;
